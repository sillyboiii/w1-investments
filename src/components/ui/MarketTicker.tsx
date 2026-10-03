"use client";

import { useEffect, useState } from "react";
import type { TickerItem } from "@/lib/marketData";

export function MarketTicker() {
  const [quotes, setQuotes] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load market data");
        const data = (await response.json()) as { quotes?: TickerItem[] };
        setQuotes(data.quotes ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load market data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if ((isLoading || error || quotes.length === 0) && quotes.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden group">
      <div className="flex items-center h-10 md:h-12">
        <div
          className="flex items-center gap-8 md:gap-10 px-6 whitespace-nowrap animate-scroll-slow will-change-transform group-hover:pause-motion motion-reduce:animate-none"
          style={{
            animationDuration: "90s",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
          }}
        >
          {[...quotes, ...quotes].map((quote, index) => {
            const quoteIndex = index % quotes.length;
            const changePct = quote.changePercent;
            const isPositive = changePct !== null && changePct > 0;
            const isNegative = changePct !== null && changePct < 0;

            return (
              <div
                key={`${quote.symbol}-${index}`}
                className={`items-center gap-2 md:gap-3 ${quoteIndex > 9 ? "hidden md:flex" : "flex"}`}
              >
                <span className="text-xs md:text-sm font-sans font-medium tracking-tight text-white/95">
                  {quote.name ?? quote.symbol}
                </span>
                <span className="text-white/35">·</span>
                <span className="text-xs font-sans text-white/55 tracking-tight">
                  {quote.symbol}
                </span>
                {quote.price !== null && (
                  <>
                    <span className="text-white/35">·</span>
                  <span className="text-xs md:text-sm font-sans text-white/90 tabular-nums">
                    {quote.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  </>
                )}
                {changePct !== null && (
                  <>
                    <span className="text-white/35">·</span>
                  <span
                    className={`text-xs md:text-sm font-sans tabular-nums ${
                      isPositive
                        ? "text-emerald-400"
                        : isNegative
                        ? "text-red-400"
                        : "text-white/60"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {changePct.toFixed(2)}%
                  </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
