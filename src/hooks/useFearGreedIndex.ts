"use client";

import { useState, useEffect } from "react";

interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
}

export function useFearGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        setLoading(true);
        // Alternative.me API for Fear & Greed Index
        const response = await fetch("https://api.alternative.me/fng/");

        if (!response.ok) {
          throw new Error("Failed to fetch Fear & Greed Index");
        }

        const result = await response.json();
        setData(result.data[0]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to mock data
        setData({
          value: 46,
          value_classification: "Fear",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFearGreedIndex();

    // Refresh every 5 minutes
    const interval = setInterval(fetchFearGreedIndex, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
