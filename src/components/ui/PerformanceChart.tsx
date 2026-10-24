"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ReturnPoint } from "@/lib/portfolio";

interface SeriesMeta {
  key: keyof Omit<ReturnPoint, "t">;
  label: string;
  color: string;
  width: number;
}

export const CHART_SERIES: SeriesMeta[] = [
  { key: "portfolio", label: "W1 Portfolio", color: "#0f0f0f", width: 3 },
  { key: "sp500", label: "S&P 500", color: "#8a9bb0", width: 2.25 },
  { key: "ftse", label: "FTSE 100", color: "#c2703a", width: 2.25 },
];

const PAD = { top: 18, right: 14, bottom: 30, left: 46 };
const N = 140;

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return [min, max];
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out.filter((v) => v >= min - 1e-9 && v <= max + 1e-9);
}

function fmtAxis(t: number, spanDays: number): string {
  const d = new Date(t * 1000);
  if (spanDays > 200) return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  if (spanDays > 45) return d.toLocaleDateString("en-US", { month: "short" });
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function fmtTooltipDate(t: number): string {
  return new Date(t * 1000).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtPctShort(v: number | null): string {
  if (v == null) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function resample(series: ReturnPoint[], key: keyof Omit<ReturnPoint, "t">, t0: number, t1: number): (number | null)[] {
  const out: (number | null)[] = new Array(N).fill(null);
  if (series.length === 0 || t1 === t0) return out;
  let idx = 0;
  for (let i = 0; i < N; i++) {
    const t = t0 + ((t1 - t0) * i) / (N - 1);
    while (idx < series.length - 1 && series[idx + 1].t <= t) idx++;
    const a = series[idx];
    if (a.t > t + 1) continue;
    if (a.t > t) {
      const va = a[key];
      if (va == null) continue;
      out[i] = va;
      continue;
    }
    const b = series[Math.min(idx + 1, series.length - 1)];
    const va = a[key];
    const vb = b[key];
    if (va == null && vb == null) continue;
    if (va == null) {
      out[i] = vb;
      continue;
    }
    if (vb == null || b.t === a.t) {
      out[i] = va;
      continue;
    }
    if (t >= b.t) {
      out[i] = vb;
      continue;
    }
    const f = (t - a.t) / (b.t - a.t);
    out[i] = va + (vb - va) * f;
  }
  return out;
}

interface Props {
  series: ReturnPoint[];
  height?: number;
}

export function PerformanceChart({ series, height }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(1, el.clientWidth || 800));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeSeries = useMemo(
    () => CHART_SERIES.filter((s) => series.some((p) => p[s.key] != null)),
    [series],
  );

  const h = height ?? (width < 640 ? 240 : 360);
  const innerW = Math.max(width - PAD.left - PAD.right, 10);
  const innerH = Math.max(h - PAD.top - PAD.bottom, 10);

  const domain = useMemo(() => {
    if (series.length === 0) {
      return { t0: 0, t1: 1, yMin: -1, yMax: 1, ticks: [-1, 0, 1], xXs: [] };
    }
    const first = series[0]?.t ?? 0;
    const last = series[series.length - 1]?.t ?? 1;
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of series) {
      for (const s of CHART_SERIES) {
        const v = p[s.key];
        if (v == null) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      lo = -1;
      hi = 1;
    }
    if (hi - lo < 0.4) {
      hi += 0.3;
      lo -= 0.3;
    }
    const pad = Math.max((hi - lo) * 0.12, 0.2);
    const yMin = lo - pad;
    const yMax = hi + pad;
    const ticks = niceTicks(yMin, yMax, 5);
    const spanDays = Math.max(1, (last - first) / 86400);
    const labelCount = Math.min(6, Math.max(2, Math.floor(innerW / 90)));
    const xXs: { t: number; label: string }[] = [];
    for (let i = 0; i < labelCount; i++) {
      const t = first + ((last - first) * i) / (labelCount - 1);
      xXs.push({ t, label: fmtAxis(t, spanDays) });
    }
    return { t0: first, t1: last, yMin, yMax, ticks, xXs, spanDays };
  }, [series, innerW]);

  const paths = useMemo(() => {
    const res: Record<string, string> = {};
    for (const s of CHART_SERIES) {
      const vals = resample(series, s.key, domain.t0, domain.t1);
      let d = "";
      let started = false;
      for (let i = 0; i < vals.length; i++) {
        const v = vals[i];
        if (v == null) {
          started = false;
          continue;
        }
        const x = PAD.left + (i / (N - 1)) * innerW;
        const y = PAD.top + (1 - (v - domain.yMin) / (domain.yMax - domain.yMin)) * innerH;
        if (y < PAD.top - 10 || y > PAD.top + innerH + 10) {
          started = false;
          continue;
        }
        d += `${started ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)} `;
        started = true;
      }
      if (d.trim()) res[s.key] = d.trim();
    }
    return res;
  }, [series, domain, innerW, innerH]);

  const sy0Fn = useMemo(() => (v: number) => PAD.top + (1 - (v - domain.yMin) / (domain.yMax - domain.yMin)) * innerH, [domain.yMin, domain.yMax, innerH]);

  const areaFrom = useMemo(() => {
    const vals = resample(series, "portfolio", domain.t0, domain.t1);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      if (v == null) continue;
      pts.push({ x: PAD.left + (i / (N - 1)) * innerW, y: PAD.top + (1 - (v - domain.yMin) / (domain.yMax - domain.yMin)) * innerH });
    }
    if (pts.length < 2) return "";
    const y0 = sy0Fn(0);
    if (y0 < PAD.top) return "";
    let d = `M${pts[0].x.toFixed(2)} ${y0.toFixed(2)} `;
    for (const p of pts) d += `L${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    d += `L${pts[pts.length - 1].x.toFixed(2)} ${y0.toFixed(2)} Z`;
    return d;
  }, [series, domain, innerW, innerH, sy0Fn]);

  const lastOf = (key: keyof Omit<ReturnPoint, "t">) => {
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i][key] != null) return series[i][key];
    }
    return null;
  };

  const endPoint = (key: string) => {
    const vals = resample(series, key as keyof Omit<ReturnPoint, "t">, domain.t0, domain.t1);
    for (let i = vals.length - 1; i >= 0; i--) {
      const v = vals[i];
      if (v != null) {
        const x = PAD.left + (i / (N - 1)) * innerW;
        const y = PAD.top + (1 - (v - domain.yMin) / (domain.yMax - domain.yMin)) * innerH;
        return { x, y };
      }
    }
    return null;
  };

  const sx = (t: number) =>
    PAD.left + (domain.t1 === domain.t0 ? 0 : ((t - domain.t0) / (domain.t1 - domain.t0)) * innerW);

  const [hover, setHover] = useState<number | null>(null);

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = relX / rect.width;
    const t = domain.t0 + ratio * (domain.t1 - domain.t0);
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < series.length; i++) {
      const d = Math.abs(series[i].t - t);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setHover(best);
  };

  const hoverPoint = hover != null && hover < series.length ? series[hover] : null;
  const zeroY = sy0Fn(0);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {activeSeries.map((s) => {
          const v = lastOf(s.key);
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs tracking-tight text-foreground">{s.label}</span>
              <span className={`text-xs tabular-nums ${v == null ? "text-muted" : v >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {fmtPctShort(v)}
              </span>
            </div>
          );
        })}
      </div>

      <svg
        width={width}
        height={h}
        viewBox={`0 0 ${width} ${h}`}
        className="block select-none touch-none w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (!t || !containerRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = t.clientX - rect.left;
          const ratio = relX / rect.width;
          const tt = domain.t0 + ratio * (domain.t1 - domain.t0);
          let best = 0;
          let bestD = Infinity;
          for (let i = 0; i < series.length; i++) {
            const d = Math.abs(series[i].t - tt);
            if (d < bestD) { bestD = d; best = i; }
          }
          setHover(best);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (!t || !containerRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = t.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, relX / rect.width));
          const tt = domain.t0 + ratio * (domain.t1 - domain.t0);
          let best = 0;
          let bestD = Infinity;
          for (let i = 0; i < series.length; i++) {
            const d = Math.abs(series[i].t - tt);
            if (d < bestD) { bestD = d; best = i; }
          }
          setHover(best);
        }}
        onTouchEnd={() => setHover(null)}
      >
        <defs>
          <linearGradient id="pf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f0f0f" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {domain.ticks.map((v) => (
          <g key={`y-${v}`}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={sy0Fn(v)}
              y2={sy0Fn(v)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={PAD.left - 6}
              y={sy0Fn(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted"
              style={{ fontSize: 9, fontVariantNumeric: "tabular-nums" }}
            >
              {fmtPctShort(v)}
            </text>
          </g>
        ))}

        {zeroY >= PAD.top && zeroY <= PAD.top + innerH && (
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--foreground)"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        )}

        {domain.xXs.map((x, i) => (
          <text
            key={`x-${i}`}
            x={sx(x.t)}
            y={h - 10}
            textAnchor={i === 0 ? "start" : i === domain.xXs.length - 1 ? "end" : "middle"}
            className="fill-muted"
            style={{ fontSize: 9 }}
          >
            {x.label}
          </text>
        ))}

        {areaFrom && <path d={areaFrom} fill="url(#pf-area)" />}

        {CHART_SERIES.map((s) => {
          const d = paths[s.key];
          if (!d) return null;
          return (
            <path
              key={s.key}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.key === "portfolio" ? undefined : "4 3"}
            />
          );
        })}

        {activeSeries.map((s) => {
          const pt = endPoint(s.key);
          if (!pt) return null;
          return <circle key={`end-${s.key}`} cx={pt.x} cy={pt.y} r={3} fill={s.color} />;
        })}

        {hoverPoint && (
          <line
            x1={sx(hoverPoint.t)}
            x2={sx(hoverPoint.t)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke="var(--foreground)"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        )}
      </svg>

      {hoverPoint && (
        <div
          className="pointer-events-none absolute z-10 min-w-[150px] border border-border bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm"
          style={{
            left: Math.min(Math.max(sx(hoverPoint.t) - 75, 4), Math.max(width - 156, 4)),
            top: 6,
          }}
        >
          <p className="mb-1 text-[10px] uppercase tracking-widest text-muted">{fmtTooltipDate(hoverPoint.t)}</p>
          {activeSeries.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="tabular-nums text-foreground">{fmtPctShort(hoverPoint[s.key])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
