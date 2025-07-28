"use client";

import { useState, useEffect } from "react";

export interface SolanaToken {
  address: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  createdAt: number;
  logoUrl: string;
}

export function useSolanaNewTokens() {
  const [tokens, setTokens] = useState<SolanaToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Enhanced mock data with better logo URLs
  const generateMockTokens = (): SolanaToken[] => {
    const mockTokens: SolanaToken[] = [
      {
        address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        name: "Solana Pepe",
        symbol: "SPEPE",
        price: 0.000234,
        marketCap: 2340000,
        volume24h: 450000,
        priceChange24h: 15.7,
        createdAt: Date.now() - 3600000,
        logoUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      },
      {
        address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        name: "Moon Rocket",
        symbol: "MOON",
        price: 0.00156,
        marketCap: 1560000,
        volume24h: 230000,
        priceChange24h: -8.3,
        createdAt: Date.now() - 7200000,
        logoUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      },
      {
        address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        name: "Doge Killer",
        symbol: "DOGEK",
        price: 0.0089,
        marketCap: 8900000,
        volume24h: 1200000,
        priceChange24h: 42.1,
        createdAt: Date.now() - 1800000,
        logoUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
      },
      {
        address: "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
        name: "Solana Inu",
        symbol: "SINU",
        price: 0.000067,
        marketCap: 670000,
        volume24h: 89000,
        priceChange24h: -12.4,
        createdAt: Date.now() - 5400000,
        logoUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
      },
      {
        address: "8HGyAAB118kmvcRfGPn7VEMuVApuEqapXctQaLZM3tRe",
        name: "Bonk 2.0",
        symbol: "BONK2",
        price: 0.00234,
        marketCap: 23400000,
        volume24h: 3400000,
        priceChange24h: 28.9,
        createdAt: Date.now() - 900000,
        logoUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ/logo.png",
      },
      {
        address: "5KJwLmYvE3WRohrbaAHf7UsQ7stQWhAjbChiRVfQ5dHx",
        name: "Shiba Sol",
        symbol: "SHISOL",
        price: 0.000123,
        marketCap: 1230000,
        volume24h: 180000,
        priceChange24h: -5.7,
        createdAt: Date.now() - 10800000,
        logoUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
      },
    ];

    return mockTokens.map((token) => ({
      ...token,
      price: token.price * (0.9 + Math.random() * 0.2),
      priceChange24h: token.priceChange24h + (Math.random() - 0.5) * 10,
      volume24h: token.volume24h * (0.8 + Math.random() * 0.4),
    }));
  };

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockData = generateMockTokens();
        setTokens(mockData);
        setLastUpdated(new Date());
      } catch (err) {
        setError("Failed to fetch token data");
        console.error("Error fetching tokens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchTokens, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    tokens,
    loading,
    error,
    lastUpdated,
  };
}
