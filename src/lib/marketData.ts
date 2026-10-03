export interface TickerItem {
  symbol: string;
  name?: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

export interface MarketData {
  quotes: TickerItem[];
  isLoading: boolean;
  error: string | null;
  isMarketClosed?: boolean;
}

const DEFAULT_SYMBOLS = [
  "^GSPC",
  "^DJI",
  "^IXIC",
  "^FTSE",
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "V",
  "MA",
  "UNH",
  "JNJ",
  "SHEL",
  "HSBA.L",
  "BP.L",
  "AZN.L",
  "RIO.L",
  "DGE.L",
  "NG.L",
  "BATS.L",
  "CRH",
];

const CACHE_DURATION = 60 * 1000; // 1 minute

let cache: {
  data: TickerItem[];
  timestamp: number;
} | null = null;

export async function fetchMarketData(): Promise<TickerItem[]> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_MARKET_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_MARKET_API_BASE_URL;

    if (!apiKey || !baseUrl) {
      return DEFAULT_SYMBOLS.slice(0, 12).map((symbol) => ({
        symbol,
        price: null,
        change: null,
        changePercent: null,
      }));
    }

    const symbols = DEFAULT_SYMBOLS.join(",");
    const url = `${baseUrl}/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Market API error: ${response.status}`);
    }

    const data = await response.json();

    const quotes: TickerItem[] = DEFAULT_SYMBOLS.map((symbol) => {
      const quote = data[symbol] || data[symbol.toUpperCase()] || {};
      return {
        symbol,
        name: quote.name || quote.shortName,
        price: typeof quote.price === "number" ? quote.price : quote.regularMarketPrice || null,
        change: typeof quote.change === "number" ? quote.change : quote.regularMarketChange || null,
        changePercent:
          typeof quote.changePercent === "number"
            ? quote.changePercent
            : quote.regularMarketChangePercent || null,
      };
    });

    cache = { data: quotes, timestamp: now };
    return quotes;
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    if (cache) return cache.data;
    return DEFAULT_SYMBOLS.slice(0, 12).map((symbol) => ({
      symbol,
      price: null,
      change: null,
      changePercent: null,
    }));
  }
}
