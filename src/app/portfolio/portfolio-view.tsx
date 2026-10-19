"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

  const { totals, positions = [], settings } = data;
  const currency = "USD";
  const hasPositions = Boolean(data.hasPositions) && positions.length > 0;
  const allocation = [...positions].sort((a, b) => b.weight - a.weight);
  const alpha =
    periodReturns.portfolio != null && periodReturns.sp500 != null
      ? periodReturns.portfolio - periodReturns.sp500
      : null;

  const chartPanel = (
    <div className="pt-8">
      <PerformanceChart series={returnSeries} />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="W1 Portfolio"
          value={hasPositions ? fmtPct(periodReturns.portfolio) : "—"}
          sub={hasPositions ? undefined : "Awaiting first position"}
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
      {hasPositions ? (
        <>
          <Reveal>
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total Value"
              value={fmtCurrency(totals.totalValue, currency)}
              sub={`Cash ${fmtCurrency(totals.cash, currency)} · Invested ${fmtCurrency(totals.totalMarketValue, currency)}`}
            />
            <Stat
              label="Total Return"
              value={fmtPct(totals.totalReturnPct)}
              sub={`${totals.totalReturnAbs >= 0 ? "+" : "−"}${fmtCurrency(Math.abs(totals.totalReturnAbs), currency)} since inception`}
              tone={totals.totalReturnPct >= 0 ? "up" : "down"}
            />
            <Stat
              label="Today"
              value={totals.dayChange == null ? "—" : `${totals.dayChange >= 0 ? "+" : "−"}${fmtCurrency(Math.abs(totals.dayChange), currency)}`}
              sub={totals.dayChangePct == null ? "Markets closed" : fmtPct(totals.dayChangePct)}
              tone={totals.dayChange == null ? "neutral" : totals.dayChange >= 0 ? "up" : "down"}
            />
            <Stat
              label="Cash"
              value={fmtCurrency(totals.cash, currency)}
              sub={settings?.name ? settings.name : `Base ${fmtCurrency(totals.startingBalance, currency)}`}
            />

            <div className="mt-10 flex flex-col gap-5 border-t border-border pt-8 sm:col-span-2 lg:col-span-4 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                index="01"
                title="Performance"
                note="Fund return compared with the S&P 500 and FTSE 100."
              />
              <RangeToggle range={range} onChange={setRange} />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">{chartPanel}</div>
          </section>
          </Reveal>

          {allocation.length > 0 && (
            <Reveal delay={0.05}>
            <section className="mt-16 border-t border-border pt-8">
              <SectionHeading index="02" title="Allocation" note="Weighting by market value." />
              <div className="mt-8 space-y-3">
                {allocation.map((p) => {
                  const href = p.research?.slug ? `/research/${p.research.slug}` : null;
                  const row = (
                    <>
                      <span
                        className={`w-20 shrink-0 text-sm font-medium ${
                          href ? "border-b border-transparent group-hover:border-ink" : ""
                        }`}
                      >
                        {p.ticker}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden bg-border/40">
                        <div
                          className="h-full bg-ink transition-[width] duration-500 ease-out"
                          style={{ width: `${Math.max(p.weight, 0.5)}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted">
                        {p.weight.toFixed(1)}%
                      </span>
                    </>
                  );
                  return href ? (
                    <Link key={p._id} href={href} className="group flex items-center gap-4">
                      {row}
                    </Link>
                  ) : (
                    <div key={p._id} className="group flex items-center gap-4">
                      {row}
                    </div>
                  );
                })}
              </div>
            </section>
            </Reveal>
          )}

          <Reveal delay={0.08}>
          <section className="mt-16 border-t border-border pt-8">
            <SectionHeading
              index={allocation.length > 0 ? "03" : "02"}
              title="Holdings"
              note={
                positions.some((p) => p.research?.slug)
                  ? "Prices refresh about every minute. Select a holding to read its research."
                  : "Prices refresh about every minute."
              }
            />
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
                        <td className={`py-3 pr-4 text-right tabular-nums ${(p.dayChangePct ?? 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
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
          </section>
          </Reveal>
        </>
      ) : (
        <>
          <Reveal>
          <section className="border-y border-border py-10 md:py-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Pre-launch</p>
            <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight md:text-5xl">
              The fund is being assembled. The portfolio opens with its first position.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
              Nothing has been invested yet, so there are no holdings to report. Until the first
              position is placed, here is how the markets we benchmark against are moving.
            </p>
          </section>
          </Reveal>

          <Reveal delay={0.05}>
          <section className="pt-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeading
                index="01"
                title="Market benchmarks"
                note="The fund's own line appears once it begins investing."
              />
              <RangeToggle range={range} onChange={setRange} />
            </div>
            {chartPanel}
          </section>
          </Reveal>

          <Reveal delay={0.1}>
          <section className="mt-16 border-t border-border pt-8">
            <SectionHeading index="02" title="What will be published here" />
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                { t: "Total value", d: "Fund value broken down into cash and invested capital, marked to live prices." },
                { t: "Allocation", d: "Positioning by weight across every holding in the book." },
                { t: "Attribution", d: "Fund performance measured against the S&P 500 and FTSE 100." },
              ].map((c) => (
                <div key={c.t} className="border-t border-border pt-5">
                  <h3 className="font-serif text-xl tracking-tight">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.d}</p>
                </div>
              ))}
            </div>
          </section>
          </Reveal>
        </>
      )}
    </div>
  );
}
