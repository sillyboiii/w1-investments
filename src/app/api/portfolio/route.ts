import { NextResponse } from "next/server";
import { sanityClient } from "@/sanity/lib/client";
import { portfolioPositionsQuery, portfolioSettingsQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";
import type { PerformancePoint, PortfolioPosition, PortfolioSettings } from "@/lib/portfolio";

export const revalidate = 60;
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
  notes?: string;
}

function monthsAgoIso(months: number): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_POSITIONS = [
  { ticker: "AAPL", name: "Apple", shares: 40, costBasis: 300, months: 11 },
  { ticker: "MSFT", name: "Microsoft", shares: 25, costBasis: 470, months: 10 },
  { ticker: "XOM", name: "Exxon Mobil", shares: 70, costBasis: 150, months: 9 },
  { ticker: "JPM", name: "JPMorgan Chase", shares: 35, costBasis: 300, months: 8 },
  { ticker: "V", name: "Visa", shares: 30, costBasis: 340, months: 7 },
  { ticker: "GOOGL", name: "Alphabet", shares: 35, costBasis: 310, months: 6 },
  { ticker: "AMZN", name: "Amazon", shares: 42, costBasis: 235, months: 4 },
  { ticker: "NVDA", name: "NVIDIA", shares: 45, costBasis: 200, months: 3 },
];

// Index proxies available on Nasdaq (keyless fallback when Yahoo rate-limits).
const NASDAQ_PROXY: Record<string, string> = { "^GSPC": "SPY", "^FTSE": "EWU" };
const CACHE_TTL_MS = 5 * 60 * 1000;
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
      return { series, price, prevClose: prev ? prev.c : null };
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
  const nasdaqSymbol = isIndex
    ? NASDAQ_PROXY[symbol]
    : symbol.includes(".")
      ? undefined
      : symbol;
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

function buildPerformance(
  positions: RawPosition[],
  map: Map<string, SymbolData>,
  cash: number,
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
    let portfolio = cash;
    for (const p of positions) {
      const ticker = p.ticker || "";
      const hasData = map.has(ticker);
      const price = hasData ? valueAt(ticker, date) : null;
      const bought = dateToSec(p.purchaseDate);
      const held = bought === null || date >= bought;
      const unit = held && price != null ? price : p.costBasis ?? 0;
      portfolio += (p.shares ?? 0) * unit;
    }
    points.push({
      t: date,
      portfolio: Number.isFinite(portfolio) ? portfolio : null,
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
    const clipped = points.filter((p) => p.t >= minPurchase);
    if (clipped.length >= 2) return clipped;
  }
  return points;
}

export async function GET() {
  try {
    let settings: PortfolioSettings | null = null;
    let rawPositions: RawPosition[] = [];
    let sample = false;

    if (isSanityConfigured) {
      const [s, p] = await Promise.all([
        sanityClient.fetch<PortfolioSettings | null>(portfolioSettingsQuery),
        sanityClient.fetch<RawPosition[]>(portfolioPositionsQuery),
      ]);
      settings = s ?? null;
      rawPositions = p ?? [];
    }

    if (!settings && rawPositions.length === 0) {
      sample = true;
      settings = {
        name: "W1 Fund I (illustrative)",
        cash: 35330,
        startingBalance: 120000,
        notes: "Illustrative sample holdings shown for demonstration.",
      };
      rawPositions = SAMPLE_POSITIONS.map((s) => ({
        _id: `sample-${s.ticker}`,
        ticker: s.ticker,
        name: s.name,
        shares: s.shares,
        costBasis: s.costBasis,
        purchaseDate: monthsAgoIso(s.months),
      }));
    }

    const symbols = [
      SP500_SYMBOL,
      FTSE_SYMBOL,
      ...rawPositions.map((p) => p.ticker || ""),
    ];
    const map = await fetchMany(symbols);

    const cash = settings?.cash ?? 0;
    let totalMarketValue = 0;
    let dayChangeTotal = 0;
    let dayChangeIncluded = false;

    const positions: PortfolioPosition[] = rawPositions.map((p, index) => {
      const ticker = p.ticker || "";
      const data = map.get(ticker);
      const price = data?.price ?? null;
      const prevClose = data?.prevClose ?? null;
      const shares = p.shares ?? 0;
      const marketValue = price != null ? shares * price : null;
      if (marketValue != null) totalMarketValue += marketValue;
      const costBasis = p.costBasis ?? 0;
      const costTotal = shares * costBasis;
      const unrealized = marketValue != null ? marketValue - costTotal : null;
      const unrealizedPct =
        unrealized != null && costTotal > 0 ? (unrealized / costTotal) * 100 : null;
      const dayChange = price != null && prevClose != null ? (price - prevClose) * shares : null;
      if (dayChange != null) {
        dayChangeTotal += dayChange;
        dayChangeIncluded = true;
      }
      return {
        _id: p._id || `position-${index}`,
        ticker,
        name: p.name,
        shares,
        costBasis,
        purchaseDate: p.purchaseDate,
        notes: p.notes,
        price,
        prevClose,
        marketValue,
        costTotal,
        unrealized,
        unrealizedPct,
        dayChange,
        dayChangePct:
          price != null && prevClose != null && prevClose !== 0
            ? ((price - prevClose) / prevClose) * 100
            : null,
        weight: 0,
      };
    });

    for (const pos of positions) {
      pos.weight = totalMarketValue > 0 && pos.marketValue != null ? (pos.marketValue / totalMarketValue) * 100 : 0;
    }

    const totalValue = cash + totalMarketValue;
    const startingBalance = settings?.startingBalance ?? totalValue;
    const totalReturnAbs = totalValue - startingBalance;
    const totalReturnPct = startingBalance > 0 ? (totalReturnAbs / startingBalance) * 100 : 0;
    const priorValue = totalValue - (dayChangeIncluded ? dayChangeTotal : 0);

    const performance = buildPerformance(rawPositions, map, cash);

    return NextResponse.json(
      {
        ok: true,
        sample,
        settings,
        positions,
        totals: {
          cash,
          totalMarketValue,
          totalValue,
          startingBalance,
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
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
