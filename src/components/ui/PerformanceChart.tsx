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

type Pt = { x: number; y: number };
type PtSeries = Record<string, (Pt | null)[]>;

const PAD = { top: 18, right: 14, bottom: 30, left: 46 };
const N = 140;
const ANIM_MS = 520;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
  return out;
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
    if (a.t > t) continue;
    const b = series[Math.min(idx + 1, series.length - 1)];
    const va = a[key];
    const vb = b[key];
    if (va == null && vb == null) continue;
    if (va == null) {
      out[i] = vb;
    } else if (vb == null || b.t === a.t) {
      out[i] = va;
    } else {
      const f = (t - a.t) / (b.t - a.t);
      out[i] = va + (vb - va) * f;
    }
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
  const [hover, setHover] = useState<number | null>(null);
  const animRef = useRef<PtSeries>({});
  const [anim, setAnim] = useState<PtSeries>({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || 800);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeSeries = useMemo(
    () => CHART_SERIES.filter((s) => series.some((p) => p[s.key] != null)),
    [series],
  );

  const h = height ?? (width < 640 ? 260 : 360);
  const innerW = Math.max(width - PAD.left - PAD.right, 10);
  const innerH = Math.max(h - PAD.top - PAD.bottom, 10);

  const domain = useMemo(() => {
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
    if (hi - lo < 0.5) {
      hi += 0.5;
      lo -= 0.5;
    }
    const pad = (hi - lo) * 0.1;
    const yMin = lo - pad;
    const yMax = hi + pad;
    const ticks = niceTicks(yMin, yMax, 5).filter((v) => v >= yMin && v <= yMax);
    const spanDays = (last - first) / 86400;
    const labelCount = Math.min(6, Math.max(2, Math.floor(innerW / 110)));
    const xXs: { t: number; label: string }[] = [];
    for (let i = 0; i < labelCount; i++) {
      const t = first + ((last - first) * i) / (labelCount - 1);
      xXs.push({ t, label: fmtAxis(t, spanDays) });
    }
    return { t0: first, t1: last, yMin, yMax, ticks, xXs };
  }, [series, innerW]);

  const targets = useMemo<PtSeries>(() => {
    const out: PtSeries = {};
    for (const s of CHART_SERIES) {
      const vals = resample(series, s.key, domain.t0, domain.t1);
      out[s.key] = vals.map((v, i) =>
        v == null ? null : { x: PAD.left + (i / (N - 1)) * innerW, y: PAD.top + (1 - (v - domain.yMin) / (domain.yMax - domain.yMin)) * innerH },
      );
    }
    return out;
  }, [series, domain, innerW, innerH]);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / ANIM_MS, 1);
      const e = easeInOut(p);
      const next: PtSeries = {};
      for (const s of CHART_SERIES) {
        const tgt = targets[s.key] ?? [];
        const frm = animRef.current[s.key] ?? tgt;
        next[s.key] = tgt.map((tp, i) => {
          const fp = frm[i];
          if (!tp && !fp) return null;
          if (!fp) return tp;
          if (!tp) return fp;
          return { x: fp.x + (tp.x - fp.x) * e, y: fp.y + (tp.y - fp.y) * e };
        });
      }
      animRef.current = next;
      setAnim(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targets]);

  const sy0 = (v: number) => PAD.top + (1 - (v - domain.yMin) / (domain.yMax - domain.yMin)) * innerH;

  const pathFrom = (key: string) => {
    const pts = anim[key] ?? [];
    let d = "";
    let started = false;
    for (const pt of pts) {
      if (!pt) {
        started = false;
        continue;
      }
      d += `${started ? "L" : "M"}${pt.x.toFixed(2)} ${pt.y.toFixed(2)} `;
      started = true;
    }
    return d.trim();
  };

  const areaFrom = () => {
    const pts = (anim["portfolio"] ?? []).filter((p): p is Pt => Boolean(p));
    if (pts.length < 2) return "";
    const y0 = sy0(0);
    let d = `M${pts[0].x.toFixed(2)} ${y0.toFixed(2)} `;
    for (const p of pts) d += `L${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    d += `L${pts[pts.length - 1].x.toFixed(2)} ${y0.toFixed(2)} Z`;
    return d;
  };

  const lastOf = (key: keyof Omit<ReturnPoint, "t">) => {
    for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) return series[i][key];
    return null;
  };

  const endPoint = (key: string): Pt | null => {
    const pts = anim[key] ?? [];
    for (let i = pts.length - 1; i >= 0; i--) if (pts[i]) return pts[i];
    return null;
  };

  const sx = (t: number) =>
    PAD.left + (domain.t1 === domain.t0 ? 0 : ((t - domain.t0) / (domain.t1 - domain.t0)) * innerW);

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const t = domain.t0 + ((relX - PAD.left) / innerW) * (domain.t1 - domain.t0);
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

  const hoverPoint = hover != null ? series[hover] : null;
  const zeroY = sy0(0);

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
        className="block select-none touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
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
              x2={PAD.left + innerW}
              y1={sy0(v)}
              y2={sy0(v)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={PAD.left - 8}
              y={sy0(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted"
              style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
            >
              {fmtPctShort(v)}
            </text>
          </g>
        ))}

        {zeroY >= PAD.top && zeroY <= PAD.top + innerH && (
          <line
            x1={PAD.left}
            x2={PAD.left + innerW}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--foreground)"
            strokeOpacity={0.35}
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
            style={{ fontSize: 10 }}
          >
            {x.label}
          </text>
        ))}

        <path d={areaFrom()} fill="url(#pf-area)" />

        {CHART_SERIES.map((s) => {
          const d = pathFrom(s.key);
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
          return <circle key={`end-${s.key}`} cx={pt.x} cy={pt.y} r={3.1} fill={s.color} />;
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
          className="pointer-events-none absolute z-10 min-w-[160px] border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur-sm"
          style={{
            left: Math.min(Math.max(sx(hoverPoint.t) - 80, 0), Math.max(width - 168, 0)),
            top: 8,
          }}
        >
          <p className="mb-1 text-[11px] uppercase tracking-widest text-muted">{fmtTooltipDate(hoverPoint.t)}</p>
          {activeSeries.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 text-xs">
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
