"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PerformanceChart } from "@/components/ui/PerformanceChart";
import {
  RANGES,
  fmtCurrency,
  fmtPct,
  lastValue,
  sliceRange,
  toReturnSeries,
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

const APPROACH = [
  {
    title: "Objective",
    body: "Long-term capital growth through high-conviction positions in publicly listed companies.",
  },
  {
    title: "Benchmarks",
    body: "Measured against the S&P 500 and FTSE 100 on a total-return basis.",
  },
  {
    title: "Process",
    body: "Ideas are researched, challenged across fundamental, macro and quantitative views, then sized into the portfolio.",
  },
  {
    title: "Discipline",
    body: "Position limits, diversification and a documented review cadence on every holding.",
  },
];

type Tone = "up" | "down" | "neutral";

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}) {
  const toneClass =
    tone === "up" ? "text-emerald-700" : tone === "down" ? "text-red-700" : "text-ink";
  return (
    <div className="border-t border-border pt-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className={`mt-2 font-serif text-3xl tabular-nums tracking-tight md:text-4xl ${toneClass}`}>
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs leading-relaxed text-muted tabular-nums">{sub}</p> : null}
    </div>
  );
}

function SectionHeading({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-xs tabular-nums text-muted">{index}</span>
      <div>
        <h2 className="font-serif text-2xl tracking-tight md:text-3xl">{title}</h2>
        {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
      </div>
    </div>
  );
}

function RangeToggle({ range, onChange }: { range: RangeKey; onChange: (r: RangeKey) => void }) {
  const idx = RANGES.indexOf(range);
  return (
    <div className="relative inline-flex border border-border p-0.5">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 bg-ink transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 4px) / ${RANGES.length})`,
          transform: `translateX(${idx * 100}%)`,
        }}
      />
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`relative z-10 w-12 py-1.5 text-xs tracking-tight transition-colors ${
            range === r ? "text-background" : "text-foreground hover:text-ink"
          }`}
        >
          {rangeLabels[r]}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-border pt-4">
            <div className="h-3 w-20 animate-pulse bg-border/50" />
            <div className="mt-3 h-9 w-32 animate-pulse bg-border/30" />
          </div>
        ))}
      </div>
      <div className="mt-12 h-80 animate-pulse border-t border-border bg-border/10" />
    </div>
  );
}

export default function PortfolioView() {
  const router = useRouter();
  const [data, setData] = useState<PortfolioApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<RangeKey>("1Y");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      const json = (await response.json()) as PortfolioApiData;
      setData(json);
    } catch {
      setData((prev) => prev ?? { ok: false, error: "failed" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = () =>
      fetch("/api/portfolio", { cache: "no-store" })
        .then((response) => response.json() as Promise<PortfolioApiData>)
        .then((json) => {
          if (!cancelled) setData(json);
        })
        .catch(() => {
          if (!cancelled) setData((prev) => prev ?? { ok: false, error: "failed" });
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
            setRefreshing(false);
          }
        });

    run();
    const interval = setInterval(run, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
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

  if (loading) return <Loading />;

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

  const { totals, positions = [], closedPositions = [], settings } = data;
  const currency = "USD";
  const hasPositions = Boolean(data.hasPositions) && positions.length > 0;
  const cashWeight = totals.totalValue > 0 ? (totals.cash / totals.totalValue) * 100 : 0;
  const allocation = [
    ...positions.map((p) => ({
      key: p._id,
      label: p.ticker || "—",
      weight: p.weight,
      href: p.research?.slug ? `/research/${p.research.slug}` : null,
      isCash: false,
    })),
    ...(totals.cash > 0
      ? [{ key: "__cash", label: "Cash", weight: cashWeight, href: null, isCash: true }]
      : []),
  ].sort((a, b) => b.weight - a.weight);
  const alpha =
    periodReturns.portfolio != null && periodReturns.sp500 != null
      ? periodReturns.portfolio - periodReturns.sp500
      : null;
  const positionCount = `${positions.length} position${positions.length === 1 ? "" : "s"}`;
  const signed = (n: number) => `${n >= 0 ? "+" : "−"}${fmtCurrency(Math.abs(n), currency)}`;
  const updatedLabel = data.updatedAt
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(data.updatedAt))
    : null;
  const refresh = () => {
    setRefreshing(true);
    load();
  };

  const chartPanel = (
    <div className="pt-8">
      <PerformanceChart series={returnSeries} />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="W1 Portfolio"
          value={hasPositions ? fmtPct(periodReturns.portfolio) : "—"}
          sub={hasPositions ? undefined : "No holdings"}
          tone={
            hasPositions && periodReturns.portfolio != null
              ? periodReturns.portfolio >= 0
                ? "up"
                : "down"
              : "neutral"
          }
        />
        <Stat label="S&P 500" value={fmtPct(periodReturns.sp500)} />
        <Stat
          label="FTSE 100"
          value={fmtPct(periodReturns.ftse)}
          sub={alpha != null ? `${alpha >= 0 ? "+" : ""}${alpha.toFixed(2)}% vs S&P 500` : undefined}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 pb-24">
      <Reveal>
        <section className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Portfolio</p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight md:text-3xl">
              {settings?.name || "W1 Portfolio"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted tabular-nums">
              {positionCount}
            </p>
            {updatedLabel ? (
              <p className="text-xs text-muted tabular-nums">Prices as of {updatedLabel}</p>
            ) : null}
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.03}>
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Total Value"
            value={fmtCurrency(totals.totalValue, currency)}
            sub={`Capital ${fmtCurrency(totals.capital, currency)}`}
          />
          <Stat
            label="Total Return"
            value={fmtPct(totals.totalReturnPct)}
            sub={`${signed(totals.unrealizedTotal)} open · ${signed(totals.realizedTotal)} realised`}
            tone={totals.totalReturnPct > 0 ? "up" : totals.totalReturnPct < 0 ? "down" : "neutral"}
          />
          <Stat
            label="Invested"
            value={fmtCurrency(totals.openMarketValue, currency)}
            sub={hasPositions ? `${positionCount} · ${fmtCurrency(totals.deployed, currency)} at cost` : "Fully in cash"}
          />
          <Stat
            label="Cash"
            value={fmtCurrency(totals.cash, currency)}
            sub={`${cashWeight.toFixed(1)}% of portfolio`}
          />
        </section>
      </Reveal>

      <Reveal delay={0.06}>
        <section className="mt-16 border-t border-border pt-8">
          <h2 className="font-serif text-2xl tracking-tight md:text-3xl">Approach</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((item) => (
              <div key={item.title}>
                <h3 className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-muted">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.09}>
        <section className="mt-16 border-t border-border pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeading
              index="01"
              title="Performance"
              note={
                hasPositions
                  ? "Fund return compared with the S&P 500 and FTSE 100."
                  : "Benchmarks shown. The fund line appears with the first position."
              }
            />
            <RangeToggle range={range} onChange={setRange} />
          </div>
          {chartPanel}
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="mt-16 border-t border-border pt-8">
          <SectionHeading
            index="02"
            title="Allocation"
            note="Share of total portfolio value, including cash."
          />
          {allocation.length > 0 ? (
            <div className="mt-8 space-y-3">
              {allocation.map((item) => {
                const row = (
                  <>
                    <span
                      className={`w-20 shrink-0 text-sm font-medium ${
                        item.href ? "border-b border-transparent group-hover:border-ink" : ""
                      } ${item.isCash ? "text-muted" : ""}`}
                    >
                      {item.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden bg-border/40">
                      <div
                        className={`h-full transition-[width] duration-500 ease-out ${
                          item.isCash ? "bg-ink/30" : "bg-ink"
                        }`}
                        style={{ width: `${Math.max(item.weight, 0.5)}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted">
                      {item.weight.toFixed(1)}%
                    </span>
                  </>
                );
                return item.href ? (
                  <Link key={item.key} href={item.href} className="group flex items-center gap-4">
                    {row}
                  </Link>
                ) : (
                  <div key={item.key} className="group flex items-center gap-4">
                    {row}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState>No positions yet — allocation appears with the first holding.</EmptyState>
          )}
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="mt-16 border-t border-border pt-8">
          <SectionHeading
            index="03"
            title="Holdings"
            note={
              hasPositions
                ? "Prices refresh about every minute. Select a holding to read its research."
                : "Each position will link to the research behind it."
            }
          />
          {hasPositions ? (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
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
                    const href = p.research?.slug ? `/research/${p.research.slug}` : null;
                    return (
                      <tr
                        key={p._id}
                        onClick={href ? () => router.push(href) : undefined}
                        className={`border-b border-border/50 ${
                          href ? "cursor-pointer transition-colors hover:bg-border/20" : ""
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium">
                          {href ? (
                            <Link
                              href={href}
                              className="border-b border-transparent hover:border-ink"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {p.ticker}
                            </Link>
                          ) : (
                            p.ticker
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted">
                          {p.name || "—"}
                          {href ? (
                            <span className="ml-2 whitespace-nowrap text-xs text-ink/60">
                              Read thesis →
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">{p.weight.toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{p.shares.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{fmtCurrency(p.costBasis, currency, 2)}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{fmtCurrency(p.price, currency, 2)}</td>
                        <td className={`py-3 pr-4 text-right tabular-nums ${p.dayChangePct == null ? "text-muted" : p.dayChangePct >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                          {fmtPct(p.dayChangePct)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">{fmtCurrency(p.marketValue, currency)}</td>
                        <td className={`py-3 pr-4 text-right tabular-nums ${up ? "text-emerald-700" : "text-red-700"}`}>
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
          ) : (
            <EmptyState>No open positions yet.</EmptyState>
          )}
        </section>
      </Reveal>

      {closedPositions.length > 0 && (
        <Reveal delay={0.18}>
          <section className="mt-16 border-t border-border pt-8">
            <SectionHeading
              index="04"
              title="Closed positions"
              note="Realised profit or loss stays in the portfolio's cash."
            />
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted">
                    <th className="py-3 pr-4 font-medium">Ticker</th>
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium text-right">Shares</th>
                    <th className="py-3 pr-4 font-medium text-right">Avg Cost</th>
                    <th className="py-3 pr-4 font-medium text-right">Exit</th>
                    <th className="py-3 pr-4 font-medium">Closed</th>
                    <th className="py-3 pr-4 font-medium text-right">Realised</th>
                  </tr>
                </thead>
                <tbody>
                  {closedPositions.map((p) => {
                    const up = (p.realized ?? 0) >= 0;
                    return (
                      <tr key={p._id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-medium">{p.ticker}</td>
                        <td className="py-3 pr-4 text-muted">{p.name || "—"}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {p.shares.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {fmtCurrency(p.costBasis, currency, 2)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {fmtCurrency(p.closePrice, currency, 2)}
                        </td>
                        <td className="py-3 pr-4 text-muted tabular-nums">{p.closedAt || "—"}</td>
                        <td
                          className={`py-3 pr-4 text-right tabular-nums ${
                            up ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {fmtPct(p.realizedPct)}
                          <span className="ml-1 text-xs text-muted">
                            {p.realized != null ? `(${signed(p.realized)})` : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted tabular-nums">
              Total realised:{" "}
              <span
                className={totals.realizedTotal >= 0 ? "text-emerald-700" : "text-red-700"}
              >
                {signed(totals.realizedTotal)}
              </span>{" "}
              — already included in cash.
            </p>
          </section>
        </Reveal>
      )}
    </div>
  );
}
