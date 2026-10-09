"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Position {
  _id: string;
  ticker: string;
  name?: string;
  shares: number;
  costBasis?: number;
  price: number | null;
  marketValue: number | null;
  costTotal: number;
  unrealized: number | null;
  unrealizedPct: number | null;
}

interface Totals {
  cash: number;
  totalMarketValue: number;
  totalValue: number;
  startingBalance: number;
  totalReturn: number;
}

interface PortfolioSettings {
  _id?: string;
  name?: string;
  cash?: number;
  startingBalance?: number;
  updatedAt?: string;
  notes?: string;
}

interface ApiData {
  ok: boolean;
  reason?: string;
  positions?: Position[];
  totals?: Totals;
  settings?: PortfolioSettings | null;
  updatedAt?: string;
}

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function pct(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default function PortfolioView() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/portfolio", { cache: "no-store" });
        const json = await res.json();
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError("Failed to load");
          setLoading(false);
        }
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (loading) return <p className="text-muted">Loading portfolio...</p>;
  if (error) return <p className="text-muted">{error}</p>;
  if (!data) return null;
  if (!data.ok && data.reason === "sanity_not_configured") {
    return <p className="text-muted">Add Sanity environment variables to enable portfolio data.</p>;
  }
  if (!data.ok) return <p className="text-muted">Failed to load portfolio.</p>;

  const positions = data.positions || [];
  const totals = data.totals;

  if (!totals) return <p className="text-muted">No totals available.</p>;

  return (
    <>
      {positions.length === 0 && !data.settings && (
        <p className="mb-6 text-muted">
          No portfolio data. Add <Link href="/studio" className="underline">Portfolio Settings</Link> and <Link href="/studio" className="underline">Portfolio Positions</Link> in Studio to get started.
        </p>
      )}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Total Value</p>
          <p className="mt-1 text-xl font-serif">{fmt(totals.totalValue)}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Market Value</p>
          <p className="mt-1 text-xl font-serif">{fmt(totals.totalMarketValue)}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Cash</p>
          <p className="mt-1 text-xl font-serif">{fmt(totals.cash)}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Starting Balance</p>
          <p className="mt-1 text-xl font-serif">{fmt(totals.startingBalance)}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Total Return</p>
          <p className="mt-1 text-xl font-serif">{pct(totals.totalReturn)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-medium">Ticker</th>
              <th className="py-2 pr-4 font-medium">Shares</th>
              <th className="py-2 pr-4 font-medium">Avg Cost</th>
              <th className="py-2 pr-4 font-medium">Price</th>
              <th className="py-2 pr-4 font-medium">Market Value</th>
              <th className="py-2 pr-4 font-medium">Unrealized P/L</th>
              <th className="py-2 pr-4 font-medium">Unrealized %</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-muted">No active positions.</td>
              </tr>
            )}
            {positions.map((p) => (
              <tr key={p._id} className="border-b border-border/40">
                <td className="py-2 pr-4 font-medium">{p.ticker}</td>
                <td className="py-2 pr-4">{p.shares.toLocaleString()}</td>
                <td className="py-2 pr-4">{fmt(p.costBasis ?? 0)}</td>
                <td className="py-2 pr-4">{fmt(p.price)}</td>
                <td className="py-2 pr-4">{fmt(p.marketValue)}</td>
                <td className="py-2 pr-4">{fmt(p.unrealized)}</td>
                <td className="py-2 pr-4">{pct(p.unrealizedPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">Prices update ~every 60s. Data managed in Studio.</p>
    </>
  );
}
