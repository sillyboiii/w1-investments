export type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "MAX";

export const RANGES: RangeKey[] = ["1M", "3M", "6M", "YTD", "1Y", "MAX"];

export interface PortfolioSettings {
  _id?: string;
  name?: string;
  cash?: number;
  startingBalance?: number;
  updatedAt?: string;
  notes?: string;
  currency?: string;
}

export interface PortfolioPosition {
  _id: string;
  ticker: string;
  name?: string;
  shares: number;
  costBasis?: number;
  purchaseDate?: string;
  notes?: string;
  price: number | null;
  prevClose: number | null;
  marketValue: number | null;
  costTotal: number;
  unrealized: number | null;
  unrealizedPct: number | null;
  dayChange: number | null;
  dayChangePct: number | null;
  weight: number;
}

export interface PortfolioTotals {
  cash: number;
  totalMarketValue: number;
  totalValue: number;
  startingBalance: number;
  totalReturnPct: number;
  totalReturnAbs: number;
  dayChange: number | null;
  dayChangePct: number | null;
}

export interface PerformancePoint {
  t: number;
  portfolio: number | null;
  sp500: number | null;
  ftse: number | null;
}

export interface PortfolioApiData {
  ok: boolean;
  reason?: string;
  error?: string;
  hasPositions?: boolean;
  hasSettings?: boolean;
  settings?: PortfolioSettings | null;
  positions?: PortfolioPosition[];
  totals?: PortfolioTotals;
  performance?: PerformancePoint[];
  currency?: string;
  startedAt?: string | null;
  updatedAt?: string;
}

export function fmtCurrency(
  n: number | null | undefined,
  currency = "USD",
  digits = 0
): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtPct(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function fmtSignedCurrency(n: number | null | undefined, currency = "USD") {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${fmtCurrency(Math.abs(n), currency)}`;
}

export function rangeCutoff(lastT: number, range: RangeKey): number {
  if (range === "MAX") return 0;
  const d = new Date(lastT * 1000);
  if (range === "YTD") {
    return Math.floor(Date.UTC(d.getUTCFullYear(), 0, 1) / 1000);
  }
  const months = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : 12;
  const s = new Date(lastT * 1000);
  s.setUTCMonth(s.getUTCMonth() - months);
  return Math.floor(s.getTime() / 1000);
}

export function sliceRange(points: PerformancePoint[], range: RangeKey): PerformancePoint[] {
  if (points.length === 0 || range === "MAX") return points;
  const start = rangeCutoff(points[points.length - 1].t, range);
  const sliced = points.filter((p) => p.t >= start);
  return sliced.length >= 2 ? sliced : points;
}

export type ReturnPoint = {
  t: number;
  portfolio: number | null;
  sp500: number | null;
  ftse: number | null;
};

export function toReturnSeries(points: PerformancePoint[]): ReturnPoint[] {
  const base = { portfolio: null as number | null, sp500: null as number | null, ftse: null as number | null };
  for (const p of points) {
    if (base.portfolio === null && p.portfolio != null && p.portfolio !== 0) base.portfolio = p.portfolio;
    if (base.sp500 === null && p.sp500 != null && p.sp500 !== 0) base.sp500 = p.sp500;
    if (base.ftse === null && p.ftse != null && p.ftse !== 0) base.ftse = p.ftse;
    if (base.portfolio !== null && base.sp500 !== null && base.ftse !== null) break;
  }
  const rel = (v: number | null, b: number | null) =>
    v == null || b == null || b === 0 ? null : (v / b - 1) * 100;
  return points.map((p) => ({
    t: p.t,
    portfolio: rel(p.portfolio, base.portfolio),
    sp500: rel(p.sp500, base.sp500),
    ftse: rel(p.ftse, base.ftse),
  }));
}

export function lastValue(series: ReturnPoint[], key: "portfolio" | "sp500" | "ftse"): number | null {
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i][key] != null) return series[i][key];
  }
  return null;
}
