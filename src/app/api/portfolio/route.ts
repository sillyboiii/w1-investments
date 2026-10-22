import { NextResponse } from "next/server";
import { sanityClient } from "@/sanity/lib/client";
import { portfolioPositionsQuery, portfolioSettingsQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";
import type { PerformancePoint, PortfolioPosition, PortfolioSettings } from "@/lib/portfolio";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SP500_SYMBOL = "^GSPC";
const FTSE_SYMBOL = "^FTSE";
const HISTORY_RANGE = "2y";
const YAHOO_HOSTS = ["https://query1.finance.yahoo.com", "https://query2.finance.yahoo.com"];
const FETCH_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

type RawSeries = { t: number; c: number }[];

interface SymbolData {
  series: RawSeries;
  price: number;
  prevClose: number | null;
}

interface RawPosition {
  _id?: string;
  ticker?: string;
  name?: string;
  shares?: number;
  costBasis?: number;
  purchaseDate?: string;
  status?: string;
  closePrice?: number;
  closedAt?: string;
  notes?: string;
  research?: { _id?: string; title?: string; slug?: string } | null;
}

function monthsAgoIso(months: number): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

// Index proxies available on Nasdaq (keyless fallback when Yahoo rate-limits).
const NASDAQ_PROXY: Record<string, string> = { "^GSPC": "SPY", "^FTSE": "EWU" };
const CACHE_TTL_MS = 60 * 1000;
const dataCache = new Map<string, { data: SymbolData; at: number }>();

async function fetchYahoo(symbol: string): Promise<SymbolData | null> {
  for (const host of YAHOO_HOSTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${HISTORY_RANGE}&interval=1d`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": FETCH_UA, Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      const ts: number[] = result?.timestamp || [];
      const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close || [];
      const series: RawSeries = [];
      for (let i = 0; i < ts.length; i++) {
        const c = closes[i];
        if (typeof c === "number" && Number.isFinite(c)) series.push({ t: ts[i], c });
      }
      if (series.length === 0) continue;
      const last = series[series.length - 1];
      const prev = series.length > 1 ? series[series.length - 2] : null;
      const metaPrice = result?.meta?.regularMarketPrice;
      const price = typeof metaPrice === "number" && Number.isFinite(metaPrice) ? metaPrice : last.c;
      const metaPrev = result?.meta?.previousClose ?? result?.meta?.chartPreviousClose;
      const prevClose =
        typeof metaPrev === "number" && Number.isFinite(metaPrev)
          ? metaPrev
          : prev
            ? prev.c
            : null;
      return { series, price, prevClose };
    } catch {
      // try next host
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function fetchNasdaq(symbol: string): Promise<SymbolData | null> {
  const isIndex = symbol.startsWith("^");
  const nasdaqSymbol = isIndex ? NASDAQ_PROXY[symbol] : symbol.includes(".") ? undefined : symbol;
  if (!nasdaqSymbol) return null;
  const assetclass = isIndex ? "etf" : "stocks";
  const to = new Date().toISOString().slice(0, 10);
  const from = monthsAgoIso(26);
  const url = `https://api.nasdaq.com/api/quote/${encodeURIComponent(
    nasdaqSymbol,
  )}/historical?assetclass=${assetclass}&fromdate=${from}&todate=${to}&limit=600`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": FETCH_UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rows: { date?: string; close?: string }[] = json?.data?.tradesTable?.rows || [];
    const series: RawSeries = [];
    for (const r of rows) {
      if (!r?.date || !r?.close) continue;
      const t = Math.floor(Date.parse(r.date) / 1000);
      const c = Number(String(r.close).replace(/[$,]/g, ""));
      if (Number.isFinite(t) && Number.isFinite(c)) series.push({ t, c });
    }
    if (series.length === 0) return null;
    series.sort((a, b) => a.t - b.t);
    const last = series[series.length - 1];
    const prev = series.length > 1 ? series[series.length - 2] : null;
    return { series, price: last.c, prevClose: prev ? prev.c : null };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSymbol(symbol: string): Promise<SymbolData | null> {
  const cached = dataCache.get(symbol);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  let data = await fetchYahoo(symbol);
  if (!data) data = await fetchNasdaq(symbol);
  if (data) dataCache.set(symbol, { data, at: Date.now() });
  return data;
}

async function fetchMany(symbols: string[], concurrency = 1): Promise<Map<string, SymbolData>> {
  const unique = [...new Set(symbols.filter(Boolean))];
  const map = new Map<string, SymbolData>();
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const sym = unique[cursor++];
      const data = await fetchSymbol(sym);
      if (data) map.set(sym, data);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, unique.length) }, worker);
  await Promise.all(workers);
  return map;
}

function dateToSec(iso?: string): number | null {
  if (!iso) return null;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(ms) ? null : ms / 1000;
}

function isClosed(p: RawPosition): boolean {
  return p.status === "closed";
}

/**
 * Portfolio value over time.
 *
 *   value(t) = capital + Σ unrealised(t) + Σ realised(t)
 *
 * A position contributes nothing before it is bought, its mark-to-market gain
 * while it is open, and its frozen realised gain after it is closed. This is
 * the same identity used for the live totals below, so the chart always ends
 * at the same value as the holdings table.
 */
function buildPerformance(
  positions: RawPosition[],
  map: Map<string, SymbolData>,
  capital: number,
): PerformancePoint[] {
  const datesSet = new Set<number>();
  for (const s of map.values()) for (const p of s.series) datesSet.add(p.t);
  const dates = [...datesSet].sort((a, b) => a - b);
  if (dates.length < 2) return [];

  const pointers = new Map<string, number>();
  const lastVals = new Map<string, number>();
  const valueAt = (symbol: string, date: number): number | null => {
    const s = map.get(symbol)?.series;
    if (!s || s.length === 0) return null;
    let i = pointers.get(symbol) ?? 0;
    while (i < s.length && s[i].t <= date) {
      lastVals.set(symbol, s[i].c);
      i++;
    }
    pointers.set(symbol, i);
    return lastVals.get(symbol) ?? null;
  };

  const points: PerformancePoint[] = [];
  for (const date of dates) {
    const sp = valueAt(SP500_SYMBOL, date);
    const ft = valueAt(FTSE_SYMBOL, date);
    let profit = 0;
    for (const p of positions) {
      const bought = dateToSec(p.purchaseDate);
      if (bought !== null && date < bought) continue;
      const shares = p.shares ?? 0;
      const costBasis = p.costBasis ?? 0;
      const exit = p.closePrice;
      const closedSec = dateToSec(p.closedAt);
      if (isClosed(p) && typeof exit === "number") {
        if (closedSec === null || date >= closedSec) {
          profit += shares * (exit - costBasis);
          continue;
        }
      }
      const ticker = p.ticker || "";
      const price = map.has(ticker) ? valueAt(ticker, date) : null;
      if (price !== null) profit += shares * (price - costBasis);
    }
    const value = capital + profit;
    points.push({
      t: date,
      portfolio: Number.isFinite(value) ? value : null,
      sp500: sp,
      ftse: ft,
    });
  }

  let minPurchase: number | null = null;
  for (const p of positions) {
    const b = dateToSec(p.purchaseDate);
    if (b !== null && (minPurchase === null || b < minPurchase)) minPurchase = b;
  }
  if (minPurchase !== null) {
    // Before the first trade the fund is 100% cash, so the value is flat.
    // Keep a short lead-in instead of years of dead line.
    const leadIn = 30 * 86400;
    const clipped = points.filter((p) => p.t >= minPurchase - leadIn);
    if (clipped.length >= 2) return clipped;
  }
  return points;
}

export async function GET() {
  try {
    let settings: PortfolioSettings | null = null;
    let rawPositions: RawPosition[] = [];

    if (isSanityConfigured) {
      const [s, p] = await Promise.all([
        sanityClient.fetch<PortfolioSettings | null>(portfolioSettingsQuery),
        sanityClient.fetch<RawPosition[]>(portfolioPositionsQuery),
      ]);
      settings = s ?? null;
      rawPositions = p ?? [];
    }

    const openRaw = rawPositions.filter((p) => !isClosed(p));
    const closedRaw = rawPositions.filter((p) => isClosed(p));

    const symbols = [
      SP500_SYMBOL,
      FTSE_SYMBOL,
      ...rawPositions.map((p) => p.ticker || ""),
    ];
    const map = await fetchMany(symbols);

    // Capital is the fund's NAV base. It is the money the fund started with,
    // so the portfolio is always worth capital + profit, never capital + position size.
    const capital = settings?.startingBalance ?? settings?.cash ?? 0;

    const buildActive = (p: RawPosition, index: number): PortfolioPosition => {
      const ticker = p.ticker || "";
      const data = map.get(ticker);
      const price = data?.price ?? null;
      const prevClose = data?.prevClose ?? null;
      const shares = p.shares ?? 0;
      const costBasis = p.costBasis ?? 0;
      const costTotal = shares * costBasis;
      const marketValue = price != null ? shares * price : costTotal;
      const unrealized = price != null ? marketValue - costTotal : 0;
      const dayChange = price != null && prevClose != null ? (price - prevClose) * shares : null;
      return {
        _id: p._id || `position-${index}`,
        ticker,
        name: p.name,
        shares,
        costBasis,
        purchaseDate: p.purchaseDate,
        notes: p.notes,
        research: p.research ?? null,
        status: "active",
        closePrice: null,
        closedAt: null,
        price,
        prevClose,
        marketValue,
        costTotal,
        unrealized,
        unrealizedPct: costTotal > 0 ? (unrealized / costTotal) * 100 : null,
        realized: null,
        realizedPct: null,
        dayChange,
        dayChangePct:
          price != null && prevClose != null && prevClose !== 0
            ? ((price - prevClose) / prevClose) * 100
            : null,
        weight: 0,
      };
    };

    const positions = openRaw.map(buildActive);

    const closedPositions: PortfolioPosition[] = closedRaw.map((p, index) => {
      const shares = p.shares ?? 0;
      const costBasis = p.costBasis ?? 0;
      const costTotal = shares * costBasis;
      const exit = typeof p.closePrice === "number" ? p.closePrice : null;
      const realized = exit != null ? shares * (exit - costBasis) : null;
      return {
        _id: p._id || `closed-${index}`,
        ticker: p.ticker || "",
        name: p.name,
        shares,
        costBasis,
        purchaseDate: p.purchaseDate,
        notes: p.notes,
        research: p.research ?? null,
        status: "closed",
        closePrice: exit,
        closedAt: p.closedAt ?? null,
        price: exit,
        prevClose: null,
        marketValue: exit != null ? shares * exit : null,
        costTotal,
        unrealized: null,
        unrealizedPct: null,
        realized,
        realizedPct: realized != null && costTotal > 0 ? (realized / costTotal) * 100 : null,
        dayChange: null,
        dayChangePct: null,
        weight: 0,
      };
    });

    const openMarketValue = positions.reduce((sum, p) => sum + (p.marketValue ?? p.costTotal), 0);
    const deployed = positions.reduce((sum, p) => sum + p.costTotal, 0);
    const unrealizedTotal = positions.reduce((sum, p) => sum + (p.unrealized ?? 0), 0);
    const realizedTotal = closedPositions.reduce((sum, p) => sum + (p.realized ?? 0), 0);

    // cash = capital - capital deployed into open positions + realised proceeds
    //      = totalValue - open market value
    const totalValue = capital + unrealizedTotal + realizedTotal;
    const cash = totalValue - openMarketValue;

    for (const pos of positions) {
      pos.weight = totalValue > 0 ? ((pos.marketValue ?? pos.costTotal) / totalValue) * 100 : 0;
    }

    let dayChangeTotal = 0;
    let dayChangeIncluded = false;
    for (const pos of positions) {
      if (pos.dayChange != null) {
        dayChangeTotal += pos.dayChange;
        dayChangeIncluded = true;
      }
    }

    const totalReturnAbs = totalValue - capital;
    const totalReturnPct = capital > 0 ? (totalReturnAbs / capital) * 100 : 0;
    const priorValue = totalValue - (dayChangeIncluded ? dayChangeTotal : 0);

    const performance =
      rawPositions.length > 0 ? buildPerformance(rawPositions, map, capital) : [];

    // Make the chart end on the live mark, so the last point matches the table.
    if (performance.length > 0) {
      const last = performance[performance.length - 1];
      last.portfolio = totalValue;
      const sp = map.get(SP500_SYMBOL)?.price;
      const ft = map.get(FTSE_SYMBOL)?.price;
      if (sp != null) last.sp500 = sp;
      if (ft != null) last.ftse = ft;
    }

    return NextResponse.json(
      {
        ok: true,
        hasPositions: positions.length > 0,
        hasClosedPositions: closedPositions.length > 0,
        hasSettings: settings !== null,
        settings,
        positions,
        closedPositions,
        totals: {
          capital,
          cash,
          deployed,
          openMarketValue,
          totalMarketValue: openMarketValue,
          unrealizedTotal,
          realizedTotal,
          totalValue,
          startingBalance: capital,
          totalReturnPct,
          totalReturnAbs,
          dayChange: dayChangeIncluded ? dayChangeTotal : null,
          dayChangePct:
            dayChangeIncluded && priorValue > 0 ? (dayChangeTotal / priorValue) * 100 : null,
        },
        performance,
        currency: "USD",
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
