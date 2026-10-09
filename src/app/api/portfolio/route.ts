import { NextResponse } from "next/server";
import { sanityClient } from "@/sanity/lib/client";
import { portfolioPositionsQuery, portfolioSettingsQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";

const revalidate = 60;

async function fetchPrice(symbol: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const yahoo = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const res = await fetch(yahoo, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
      next: { revalidate },
    });
    if (res.ok) {
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      const quote = result?.indicators?.quote?.[0];
      const price = meta?.regularMarketPrice ?? quote?.close?.[quote.close.length - 1];
      if (typeof price === "number" && !isNaN(price)) return price;
    }
  } catch (e) {
    // ignore
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

export async function GET() {
  try {
    if (!isSanityConfigured) {
      return NextResponse.json({ ok: false, reason: "sanity_not_configured" }, { status: 200 });
    }

    const [settings, positions] = await Promise.all([
      sanityClient.fetch(portfolioSettingsQuery),
      sanityClient.fetch(portfolioPositionsQuery),
    ]);

    const prices = await Promise.all(
      (positions || []).map((p: any) => fetchPrice(p.ticker).catch(() => null))
    );

    let totalMarketValue = 0;
    const enriched = (positions || []).map((p: any, i: number) => {
      const price = prices[i];
      const shares = p.shares || 0;
      const marketValue = price !== null ? shares * price : null;
      if (marketValue !== null) totalMarketValue += marketValue;
      const costBasis = p.costBasis || 0;
      const costTotal = shares * costBasis;
      const unrealized = marketValue !== null ? marketValue - costTotal : null;
      const unrealizedPct = marketValue !== null && costTotal > 0 ? (unrealized! / costTotal) * 100 : null;
      return {
        ...p,
        price,
        marketValue,
        costTotal,
        unrealized,
        unrealizedPct,
      };
    });

    const cash = settings?.cash ?? 0;
    const startingBalance = settings?.startingBalance ?? cash + totalMarketValue;
    const totalValue = cash + totalMarketValue;
    const totalReturn = startingBalance > 0 ? ((totalValue - startingBalance) / startingBalance) * 100 : 0;

    return NextResponse.json(
      {
        ok: true,
        settings,
        positions: enriched,
        totals: {
          cash,
          totalMarketValue,
          totalValue,
          startingBalance,
          totalReturn,
        },
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
