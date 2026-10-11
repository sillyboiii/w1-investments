"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PerformanceChart } from "@/components/ui/PerformanceChart";
import {
  fmtCurrency,
  fmtPct,
  lastValue,
  sliceRange,
  toReturnSeries,
  RANGES,
  type PortfolioApiData,
  type RangeKey,
} from "@/lib/portfolio";

const rangeLabels: Record<RangeKey, string> = {
  "1M": "1M",
  "3M": "3M",
  "6M": "6M",
  YTD: "YTD",
  "1Y": "1Y",
  MAX: "Max",
};

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down" | "neutral";
}) {
  const toneClass =
    tone === "up" ? "text-emerald-700" : tone === "down" ? "text-red-700" : "text-ink";
  return (
    <div className="border border-border p-4 md:p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-2 text-xl md:text-2xl font-serif tabular-nums ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted tabular-nums">{sub}</p> : null}
    </div>
  );
}

export default function PortfolioView() {
  const [data, setData] = useState<PortfolioApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((json: PortfolioApiData) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setData({ ok: false, error: "failed" });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const returnSeries = useMemo(() => {
    if (!data?.performance || data.performance.length < 2) return [];
    return toReturnSeries(sliceRange(data.performance, range));
  }, [data, range]);

  const periodReturns = useMemo(
    () => ({
      portfolio: lastValue(returnSeries, "portfolio"),
      sp500: lastValue(returnSeries, "sp500"),
      ftse: lastValue(returnSeries, "ftse"),
    }),
    [returnSeries],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse border border-border bg-border/30" />
          ))}
        </div>
        <div className="mt-8 h-72 animate-pulse border border-border bg-border/20" />
      </div>
    );
  }

  if (!data || !data.ok || !data.totals) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 py-12">
        <p className="text-muted">
          Portfolio data is unavailable right now.{" "}
          <Link href="/studio" className="underline">
            Open Studio
          </Link>{" "}
          to manage positions.
        </p>
      </div>
    );
  }

  const { totals, positions = [], settings } = data;
  const currency = "USD";
  const gainTone = totals.totalReturnPct >= 0 ? "up" : "down";
  const dayTone =
    totals.dayChange == null ? "neutral" : totals.dayChange >= 0 ? "up" : "down";
  const allocation = [...positions].sort((a, b) => b.weight - a.weight);
  const alpha =
    periodReturns.portfolio != null && periodReturns.sp500 != null
      ? periodReturns.portfolio - periodReturns.sp500
      : null;

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 pb-24">
      {data.sample && (
        <div className="mb-8 border border-border bg-border/20 px-4 py-3 text-sm text-muted">
          <span className="font-medium text-foreground">Illustrative sample holdings.</span> These
          are placeholders for demonstration — add real positions in{" "}
          <Link href="/studio" className="underline">
            Studio
          </Link>{" "}
          to replace them.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Value"
          value={fmtCurrency(totals.totalValue, currency)}
          sub={`Cash ${fmtCurrency(totals.cash, currency)} · Invested ${fmtCurrency(totals.totalMarketValue, currency)}`}
        />
        <StatCard
          label="Total Return"
          value={fmtPct(totals.totalReturnPct)}
          sub={`${totals.totalReturnAbs >= 0 ? "+" : "−"}${fmtCurrency(Math.abs(totals.totalReturnAbs), currency)} since inception`}
          tone={gainTone}
        />
        <StatCard
          label="Today"
          value={totals.dayChange == null ? "—" : `${totals.dayChange >= 0 ? "+" : "−"}${fmtCurrency(Math.abs(totals.dayChange), currency)}`}
          sub={totals.dayChangePct == null ? undefined : fmtPct(totals.dayChangePct)}
          tone={dayTone}
        />
        <StatCard
          label="Starting Balance"
          value={fmtCurrency(totals.startingBalance, currency)}
          sub={settings?.name ? settings.name : "Simulated fund"}
        />
      </div>

      <section className="mt-12 border-t border-border pt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight">Performance</h2>
            <p className="mt-1 text-sm text-muted">
              Simulated return vs S&amp;P 500 and FTSE 100.
            </p>
          </div>
          <div className="flex flex-wrap border border-border">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs tracking-tight transition-colors ${
                  range === r
                    ? "bg-ink text-background"
                    : "text-foreground hover:bg-border/40"
                }`}
              >
                {rangeLabels[r]}
              </button>
            ))}
          </div>
        </div>

        {returnSeries.length > 1 ? (
          <>
            <PerformanceChart series={returnSeries} />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="W1 Portfolio" value={fmtPct(periodReturns.portfolio)} tone={(periodReturns.portfolio ?? 0) >= 0 ? "up" : "down"} />
              <StatCard label="S&P 500" value={fmtPct(periodReturns.sp500)} />
              <StatCard
                label="FTSE 100"
                value={fmtPct(periodReturns.ftse)}
                sub={alpha != null ? `${alpha >= 0 ? "+" : ""}${alpha.toFixed(2)}% vs S&P 500` : undefined}
              />
            </div>
          </>
        ) : (
          <p className="border border-border p-6 text-sm text-muted">
            Not enough historical data to plot performance yet. Add positions with purchase dates
          </p>
        )}
      </section>

      {allocation.length > 0 && (
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="text-2xl md:text-3xl font-serif tracking-tight">Allocation</h2>
          <p className="mt-2 text-sm text-muted">Weighting by market value.</p>
          <div className="mt-6 space-y-3">
            {allocation.map((p) => (
              <div key={p._id} className="flex items-center gap-4">
                <span className="w-20 shrink-0 text-sm font-medium">{p.ticker}</span>
                <div className="h-2 flex-1 overflow-hidden bg-border/40">
                  <div
                    className="h-full bg-ink"
                    style={{ width: `${Math.max(p.weight, 0.5)}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted">
                  {p.weight.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="text-2xl md:text-3xl font-serif tracking-tight">Holdings</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted">
                <th className="py-3 pr-4 font-medium">Ticker</th>
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium text-right">Weight</th>
                <th className="py-3 pr-4 font-medium text-right">Shares</th>
                <th className="py-3 pr-4 font-medium text-right">Avg Cost</th>
                <th className="py-3 pr-4 font-medium text-right">Price</th>
                <th className="py-3 pr-4 font-medium text-right">Day</th>
                <th className="py-3 pr-4 font-medium text-right">Market Value</th>
                <th className="py-3 pr-4 font-medium text-right">Unrealized</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const up = (p.unrealized ?? 0) >= 0;
                return (
                  <tr key={p._id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">{p.ticker}</td>
                    <td className="py-3 pr-4 text-muted">{p.name || "—"}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{p.weight.toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{p.shares.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {fmtCurrency(p.costBasis, currency, 2)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {fmtCurrency(p.price, currency, 2)}
                    </td>
                    <td
                      className={`py-3 pr-4 text-right tabular-nums ${(p.dayChangePct ?? 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {fmtPct(p.dayChangePct)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {fmtCurrency(p.marketValue, currency)}
                    </td>
                    <td
                      className={`py-3 pr-4 text-right tabular-nums ${up ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {fmtPct(p.unrealizedPct)}
                      <span className="ml-1 text-xs text-muted">
                        {p.unrealized != null
                          ? `(${p.unrealized >= 0 ? "+" : "−"}${fmtCurrency(Math.abs(p.unrealized), currency)})`
                          : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-muted">
          Simulated portfolio · prices refresh about every minute. Managed via{" "}
          <Link href="/studio" className="underline">
            Studio
          </Link>
          {settings?.name ? ` · ${settings.name}` : ""}.
        </p>
      </section>
    </div>
  );
}
