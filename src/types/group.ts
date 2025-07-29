export interface CoinCall {
  name: string;
  symbol: string;
  contract?: string;
  price_entry: number;
  price_current: number;
  price_high: number;
  market_cap: number;
  holders: number;
  buys_24h: number;
  sells_24h: number;
  performance: number; // multiplier (e.g., 2.5x)
  posted_date: string;
  chart_url: string;
  dex_url: string;
  pump_url?: string;
  internal_chart_url?: string;
  status: "active" | "rugged" | "mooned";
}

export interface GroupStats {
  total_calls: number;
  win_rate: number;
  avg_performance: number;
  best_call: CoinCall;
  worst_call: CoinCall;
  member_growth: { date: string; count: number }[];
  recent_calls: CoinCall[];
}

export interface GroupData {
  rank: number;
  name: string;
  members: number;
  launched: number;
  avgPump: string;
  best: string;
  worst: string;
  chat_id?: string;
  username?: string | null;
  creation_date?: string;
  win_rate?: number;
  total_calls?: number;
  telegram_link?: string;
  avatar?: string;
  stats?: GroupStats;
}
