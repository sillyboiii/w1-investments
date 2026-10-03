export interface TickerItem {
  symbol: string;
  name?: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

export const MARKET_SYMBOLS = [
  "FTSE",
  "SPX",
  "NDX",
  "COMP",
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
  "HSBA",
  "BP",
  "AZN",
  "RIO",
  "DGE",
  "NG",
  "BATS",
  "CRH",
];

export const MARKET_LABELS: Record<string, string> = {
  FTSE: "FTSE 100",
  SPX: "S&P 500",
  NDX: "NASDAQ 100",
  COMP: "NASDAQ Composite",
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
  HSBA: "HSBC",
  BP: "BP",
  AZN: "AstraZeneca",
  RIO: "Rio Tinto",
  DGE: "Diageo",
  NG: "National Grid",
  BATS: "BAT",
  CRH: "CRH",
};

export const YAHOO_SYMBOLS: Record<string, string> = {
  FTSE: "^FTSE",
  SPX: "^GSPC",
  NDX: "^NDX",
  SHEL: "SHEL.L",
  HSBA: "HSBA.L",
  BP: "BP.L",
  AZN: "AZN.L",
  RIO: "RIO.L",
  DGE: "DGE.L",
  NG: "NG.L",
  BATS: "BATS.L",
};
