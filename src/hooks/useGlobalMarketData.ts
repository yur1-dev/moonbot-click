"use client";

import { useState, useEffect } from "react";

interface GlobalMarketData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_change_percentage_24h_usd: number;
  active_cryptocurrencies: number;
  markets: number;
  market_cap_percentage: { [key: string]: number };
}

interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
}

interface MarketMetrics {
  fearGreed: FearGreedData | null;
  marketCap: number;
  volume24h: number;
  marketCapChange: number;
  volumeChange: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useGlobalMarketData(): MarketMetrics {
  const [data, setData] = useState<MarketMetrics>({
    fearGreed: null,
    marketCap: 0,
    volume24h: 0,
    marketCapChange: 0,
    volumeChange: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch Fear & Greed Index
      const fearGreedResponse = await fetch("https://api.alternative.me/fng/");
      const fearGreedResult = await fearGreedResponse.json();

      // Fetch Global Market Data from CoinGecko
      const marketResponse = await fetch(
        "https://api.coingecko.com/api/v3/global"
      );
      const marketResult = await marketResponse.json();

      const globalData: GlobalMarketData = marketResult.data;

      // Calculate volume change (mock for now since we need historical data)
      const volumeChange = Math.random() * 20 - 10; // Random between -10% and +10%

      setData({
        fearGreed: fearGreedResult.data[0],
        marketCap: globalData.total_market_cap.usd,
        volume24h: globalData.total_volume.usd,
        marketCapChange: globalData.market_cap_change_percentage_24h_usd,
        volumeChange: volumeChange,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      }));
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh every 2 minutes
    const interval = setInterval(fetchData, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
