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
  { key: "portfolio", label: "W1 Portfolio", color: "#0f0f0f", width: 2.5 },
  { key: "sp500", label: "S&P 500 (cash-matched)", color: "#9ca3af", width: 2 },
  { key: "ftse", label: "FTSE 100", color: "#b45309", width: 2 },
];

const N = 200;

function fmtTooltipDate(t: number): string {
  return new Date(t * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtPct(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function niceDomain(min: number, max: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: -1, max: 1 };
  if (max - min < 0.4) {
    const mid = (min + max) / 2;
    return { min: mid - 0.6, max: mid + 0.6 };
  }
  const pad = (max - min) * 0.08;
  return { min: min - pad, max: max + pad };
}

interface Props {
  series: ReturnPoint[];
  height?: number;
}

export function PerformanceChart({ series, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(320, el.clientWidth || 960));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isMobile = width < 640;
  const h = isMobile ? Math.min(height, 240) : height;
  const padL = isMobile ? 40 : 52;
  const padR = isMobile ? 12 : 20;
  const padT = 16;
  const padB = isMobile ? 28 : 36;
  const innerW = Math.max(width - padL - padR, 10);
  const innerH = Math.max(h - padT - padB, 10);

  const domain = useMemo(() => {
    if (series.length === 0) return { t0: 0, t1: 1, y0: -1, y1: 1 };
    const t0 = series[0].t;
    const t1 = series[series.length - 1].t;
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of series) {
      for (const s of CHART_SERIES) {
        const v = p[s.key];
        if (typeof v === "number" && Number.isFinite(v)) {
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
    }
    const d = niceDomain(lo, hi);
    return { t0, t1, y0: d.min, y1: d.max };
  }, [series]);

  const x = (t: number) => padL + ((t - domain.t0) / (domain.t1 - domain.t0 || 1)) * innerW;
  const y = (v: number) => padT + (1 - (v - domain.y0) / (domain.y1 - domain.y0 || 1)) * innerH;

  const paths = useMemo(() => {
    const res: Record<string, string> = {};
    for (const s of CHART_SERIES) {
      let d = "";
      let started = false;
      for (const p of series) {
        const v = p[s.key];
        if (typeof v !== "number" || !Number.isFinite(v)) {
          started = false;
          continue;
        }
        const px = x(p.t);
        const py = y(v);
        if (py < padT - 20 || py > padT + innerH + 20) {
          started = false;
          continue;
        }
        d += `${started ? "L" : "M"}${px.toFixed(2)},${py.toFixed(2)} `;
        started = true;
      }
      if (d.trim()) res[s.key] = d.trim();
    }
    return res;
  }, [series, domain, innerW, innerH, padL, padR, padT, padB]);

  const lastValues = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const s of CHART_SERIES) {
      for (let i = series.length - 1; i >= 0; i--) {
        const v = series[i][s.key];
        if (typeof v === "number") { out[s.key] = v; break; }
      }
      if (!(s.key in out)) out[s.key] = null;
    }
    return out;
  }, [series]);

  const zeroY = domain.y0 < 0 && domain.y1 > 0 ? y(0) : null;

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const t = domain.t0 + relX * (domain.t1 - domain.t0);
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < series.length; i++) {
      const d = Math.abs(series[i].t - t);
      if (d < bestD) { bestD = d; best = i; }
    }
    setHover(best);
  };

  const hoverPt = hover !== null && hover < series.length ? series[hover] : null;

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-4 md:gap-6">
        {CHART_SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-[2px] w-4" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-muted">{s.label}</span>
            <span className={`text-xs tabular-nums ${typeof lastValues[s.key] === "number" && lastValues[s.key]! >= 0 ? "text-emerald-700" : "text-foreground"}`}>
              {fmtPct(lastValues[s.key] as number | null)}
            </span>
          </div>
        ))}
      </div>

      <div className="relative w-full overflow-x-auto md:overflow-visible">
        <svg
          width={width}
          height={h}
          viewBox={`0 0 ${width} ${h}`}
          className="block min-w-[320px] select-none touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (t.clientX - rect.left) / rect.width;
            const tt = domain.t0 + relX * (domain.t1 - domain.t0);
            let best = 0; let bestD = Infinity;
            for (let i = 0; i < series.length; i++) { const d = Math.abs(series[i].t - tt); if (d < bestD) { bestD = d; best = i; } }
            setHover(best);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (!t) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (t.clientX - rect.left) / rect.width));
            const tt = domain.t0 + relX * (domain.t1 - domain.t0);
            let best = 0; let bestD = Infinity;
            for (let i = 0; i < series.length; i++) { const d = Math.abs(series[i].t - tt); if (d < bestD) { bestD = d; best = i; } }
            setHover(best);
          }}
          onTouchEnd={() => setHover(null)}
        >
          {zeroY !== null && (
            <line x1={padL} x2={width - padR} y1={zeroY} y2={zeroY} stroke="#d1d5db" strokeWidth={1} />
          )}

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
                opacity={s.key === "portfolio" ? 1 : 0.8}
              />
            );
          })}

          {hoverPt && (
            <g>
              <line x1={x(hoverPt.t)} x2={x(hoverPt.t)} y1={padT} y2={padT + innerH} stroke="#9ca3af" strokeWidth={1} strokeDasharray="2 2" />
              {CHART_SERIES.map((s) => {
                const v = hoverPt[s.key];
                if (typeof v !== "number") return null;
                return <circle key={s.key} cx={x(hoverPt.t)} cy={y(v)} r={3} fill={s.color} />;
              })}
            </g>
          )}
        </svg>

        {hoverPt && (
          <div
            className="pointer-events-none absolute z-20 border border-border bg-background px-3 py-2 shadow-sm"
            style={{
              left: Math.min(Math.max(x(hoverPt.t) - 70, 4), Math.max(width - 150, 4)),
              top: 6,
            }}
          >
            <p className="mb-1 text-[10px] uppercase tracking-widest text-muted">{fmtTooltipDate(hoverPt.t)}</p>
            {CHART_SERIES.map((s) => {
              const v = hoverPt[s.key];
              if (typeof v !== "number") return null;
              return (
                <div key={s.key} className="flex items-center justify-between gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted">
                    <span className="h-[2px] w-2.5" style={{ backgroundColor: s.color }} />
                    {s.label.split(" (")[0]}
                  </span>
                  <span className="tabular-nums text-foreground">{fmtPct(v)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
