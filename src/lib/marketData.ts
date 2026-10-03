export interface TickerItem {
  symbol: string;
  name?: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

export const MARKET_SYMBOLS = [
  "SPX",
  "DJI",
  "NDX",
  "UKX",
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

export const MARKET_LABELS: Record<string, string> = {
  SPX: "S&P 500",
  DJI: "Dow Jones",
  NDX: "NASDAQ 100",
  UKX: "FTSE 100",
  AAPL: "Apple",
  MSFT: "Microsoft",
  NVDA: "NVIDIA",
  AMZN: "Amazon",
  GOOGL: "Alphabet",
  META: "Meta",
  TSLA: "Tesla",
  V: "Visa",
  MA: "Mastercard",
  UNH: "UnitedHealth",
  JNJ: "Johnson & Johnson",
  SHEL: "Shell",
  "HSBA.L": "HSBC",
  "BP.L": "BP",
  "AZN.L": "AstraZeneca",
  "RIO.L": "Rio Tinto",
  "DGE.L": "Diageo",
  "NG.L": "National Grid",
  "BATS.L": "BAT",
  CRH: "CRH",
};
