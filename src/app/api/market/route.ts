import { NextResponse } from "next/server";
import { MARKET_LABELS, MARKET_SYMBOLS, YAHOO_SYMBOLS, type TickerItem } from "@/lib/marketData";

export const revalidate = 60;

let cache: { quotes: TickerItem[]; timestamp: number } | null = null;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeQuote(symbol: string, raw: Record<string, unknown>): TickerItem {
  return {
    symbol,
    name: MARKET_LABELS[symbol] ?? symbol,
    price:
      toNumber(raw.price) ??
      toNumber(raw.last) ??
      toNumber(raw.close) ??
      toNumber(raw.regularMarketPrice),
    change:
      toNumber(raw.change) ??
      toNumber(raw.changeValue) ??
      toNumber(raw.regularMarketChange),
    changePercent:
      toNumber(raw.changePercent) ??
      toNumber(raw.percentChange) ??
      toNumber(raw.regularMarketChangePercent),
  };
}

async function fetchYahooQuotes() {
  const yahooToSymbol = new Map(
    MARKET_SYMBOLS.map((symbol) => [YAHOO_SYMBOLS[symbol] ?? symbol, symbol]),
  );
  const symbols = Array.from(yahooToSymbol.keys()).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 W1 Investments market display",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) throw new Error(`Yahoo Finance returned ${response.status}`);

  const payload = await response.json();
  const results = payload?.quoteResponse?.result;
  if (!Array.isArray(results)) return [];

  return results
    .map((raw: Record<string, unknown>) => {
      const yahooSymbol = typeof raw.symbol === "string" ? raw.symbol : "";
      const symbol = yahooToSymbol.get(yahooSymbol);
      if (!symbol) return null;
      return normalizeQuote(symbol, raw);
    })
    .filter((quote: TickerItem | null): quote is TickerItem => {
      return Boolean(quote && quote.price !== null && quote.changePercent !== null);
    })
    .sort((a: TickerItem, b: TickerItem) => {
      return MARKET_SYMBOLS.indexOf(a.symbol) - MARKET_SYMBOLS.indexOf(b.symbol);
    });
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.timestamp < 60_000) {
    return NextResponse.json({ quotes: cache.quotes, delayed: true });
  }

  const apiKey = process.env.MARKET_API_KEY;
  const baseUrl = process.env.MARKET_API_BASE_URL;

  try {
    if (!apiKey || !baseUrl) {
      const quotes = await fetchYahooQuotes();
      cache = { quotes, timestamp: now };
      return NextResponse.json({ quotes, delayed: true });
    }

    const url = new URL(baseUrl);
    url.searchParams.set("symbol", MARKET_SYMBOLS.join(","));
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`Market API returned ${response.status}`);

    const payload = await response.json();
    const quotes = MARKET_SYMBOLS.map((symbol) => {
      const raw = payload[symbol] ?? payload[symbol.toUpperCase()] ?? {};
      return normalizeQuote(symbol, raw);
    }).filter((quote) => quote.price !== null && quote.changePercent !== null);

    cache = { quotes, timestamp: now };
    return NextResponse.json({ quotes, delayed: true });
  } catch (error) {
    console.error("Market data unavailable", error);
    return NextResponse.json({ quotes: cache?.quotes ?? [], unavailable: true });
  }
}
