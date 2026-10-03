"use client";

import { useEffect, useState } from "react";
import { fetchMarketData, type TickerItem } from "@/lib/marketData";

export function MarketTicker() {
  const [quotes, setQuotes] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMarketData();
        setQuotes(data);
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

  if (isLoading && quotes.length === 0) {
    return (
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-sm py-2 overflow-hidden">
        <div className="text-xs text-white/60 px-6">Loading market data...</div>
      </div>
    );
  }

  if (error && quotes.length === 0) {
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
            const changePct = quote.changePercent;
            const isPositive = changePct !== null && changePct > 0;
            const isNegative = changePct !== null && changePct < 0;
            const isFlat = changePct !== null && changePct === 0;

            return (
              <div key={`${quote.symbol}-${index}`} className="flex items-center gap-2 md:gap-3">
                <span className="text-xs md:text-sm font-sans font-medium tracking-tight text-white">
                  {quote.symbol}
                </span>
                {quote.price !== null && (
                  <span className="text-xs md:text-sm font-sans text-white/90 tabular-nums">
                    {quote.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
                {changePct !== null && (
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
