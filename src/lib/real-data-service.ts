// Real data service that fetches actual data from multiple sources

export interface RealTokenData {
  contract: string;
  symbol: string;
  name: string;
  price_usd: number;
  price_sol: number;
  market_cap: number;
  liquidity: number;
  volume_24h: number;
  price_change_24h: number;
  holders: number;
  transactions_24h: {
    buys: number;
    sells: number;
  };
  fdv: number;
  created_at: string;
}

export interface RealGroupCall {
  message_id: number;
  chat_id: string;
  date: string;
  text: string;
  token_contract?: string;
  token_symbol?: string;
  entry_price?: number;
  current_price?: number;
  performance?: number;
  status: "active" | "mooned" | "rugged";
}

export interface RealGroupData {
  chat_id: string;
  title: string;
  username?: string;
  member_count: number;
  description?: string;
  photo?: string;
  calls: RealGroupCall[];
  stats: {
    total_calls: number;
    win_rate: number;
    avg_performance: number;
    best_performance: number;
    worst_performance: number;
  };
}

// Fetch real token data from DexScreener API
export async function fetchRealTokenData(
  contract: string
): Promise<RealTokenData | null> {
  try {
    console.log(`Fetching token data for contract: ${contract}`);

    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${contract}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TokenTracker/1.0)",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `DexScreener API error: ${response.status} ${response.statusText}`
      );
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`DexScreener response for ${contract}:`, data);

    if (!data.pairs || data.pairs.length === 0) {
      console.log(`No pairs found for contract: ${contract}`);
      return null;
    }

    // Get the most liquid pair (usually Raydium)
    const pair = data.pairs.sort(
      (a: any, b: any) =>
        Number.parseFloat(b.liquidity?.usd || "0") -
        Number.parseFloat(a.liquidity?.usd || "0")
    )[0];

    const result = {
      contract: contract,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      price_usd: Number.parseFloat(pair.priceUsd || "0"),
      price_sol: Number.parseFloat(pair.priceNative || "0"),
      market_cap: Number.parseFloat(pair.marketCap || "0"),
      liquidity: Number.parseFloat(pair.liquidity?.usd || "0"),
      volume_24h: Number.parseFloat(pair.volume?.h24 || "0"),
      price_change_24h: Number.parseFloat(pair.priceChange?.h24 || "0"),
      holders: 0, // DexScreener doesn't provide holder count
      transactions_24h: {
        buys: Number.parseInt(pair.txns?.h24?.buys || "0"),
        sells: Number.parseInt(pair.txns?.h24?.sells || "0"),
      },
      fdv: Number.parseFloat(pair.fdv || "0"),
      created_at: pair.pairCreatedAt || new Date().toISOString(),
    };

    console.log(`Processed token data for ${contract}:`, result);
    return result;
  } catch (error) {
    console.error("Error fetching token data:", error);
    return null;
  }
}

// Fetch real token data from Jupiter API (alternative)
export async function fetchJupiterTokenData(
  contract: string
): Promise<Partial<RealTokenData> | null> {
  try {
    const response = await fetch(
      `https://price.jup.ag/v4/price?ids=${contract}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.data || !data.data[contract]) {
      return null;
    }

    const tokenData = data.data[contract];

    return {
      contract: contract,
      price_usd: tokenData.price,
      price_change_24h: tokenData.priceChange24h || 0,
    };
  } catch (error) {
    console.error("Error fetching Jupiter data:", error);
    return null;
  }
}

// Fetch real Solana token metadata
export async function fetchTokenMetadata(
  contract: string
): Promise<{ name: string; symbol: string } | null> {
  try {
    const response = await fetch(`https://api.solana.fm/v0/tokens/${contract}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      name: data.tokenlist?.name || data.name || "Unknown Token",
      symbol: data.tokenlist?.symbol || data.symbol || "UNKNOWN",
    };
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

// Parse Telegram messages to extract token calls
export function parseTokenCall(message: string): {
  contract?: string;
  symbol?: string;
  action?: "buy" | "sell";
  target?: number;
} | null {
  // Common patterns for token calls in Telegram groups
  const patterns = [
    // Contract address pattern
    /([A-Za-z0-9]{32,44})/g,
    // Symbol patterns
    /\$([A-Z]{2,10})/g,
    // Buy/sell patterns
    /(BUY|SELL|LONG|SHORT)/gi,
    // Target patterns
    /(?:target|tp|take profit).*?(\d+(?:\.\d+)?x?)/gi,
  ];

  const contractMatch = message.match(patterns[0]);
  const symbolMatch = message.match(patterns[1]);
  const actionMatch = message.match(patterns[2]);
  const targetMatch = message.match(patterns[3]);

  if (!contractMatch && !symbolMatch) {
    return null;
  }

  return {
    contract: contractMatch?.[0],
    symbol: symbolMatch?.[0]?.replace("$", ""),
    action: actionMatch?.[0]?.toLowerCase() as "buy" | "sell",
    target: targetMatch ? Number.parseFloat(targetMatch[1]) : undefined,
  };
}

// Fetch real Telegram group data (requires Telegram API access)
export async function fetchRealTelegramData(
  chatId: string,
  accessHash?: string
): Promise<RealGroupData | null> {
  try {
    // This would require actual Telegram API credentials
    // For now, we'll use the moonbot API which should have this data
    const response = await fetch(
      `https://api.moonbot.click/api/chats/${chatId}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Moonbot API error: ${response.status}`);
    }

    const data = await response.json();

    // Process messages to extract token calls
    const calls: RealGroupCall[] = [];

    for (const message of data.messages || []) {
      const tokenCall = parseTokenCall(message.text || "");

      if (tokenCall) {
        let performance = 1;
        let status: "active" | "mooned" | "rugged" = "active";

        // If we have a contract, fetch real performance data
        if (tokenCall.contract) {
          const tokenData = await fetchRealTokenData(tokenCall.contract);
          if (tokenData) {
            // Calculate performance based on price change since message date
            const messageDate = new Date(message.date);
            const daysSince =
              (Date.now() - messageDate.getTime()) / (1000 * 60 * 60 * 24);

            // Estimate entry price (this would need historical data for accuracy)
            const estimatedEntryPrice =
              tokenData.price_usd / (1 + tokenData.price_change_24h / 100);
            performance = tokenData.price_usd / estimatedEntryPrice;

            if (performance > 2) status = "mooned";
            else if (performance < 0.5) status = "rugged";
          }
        }

        calls.push({
          message_id: message.id,
          chat_id: chatId,
          date: message.date,
          text: message.text,
          token_contract: tokenCall.contract,
          token_symbol: tokenCall.symbol,
          performance: performance,
          status: status,
        });
      }
    }

    // Calculate real statistics
    const winningCalls = calls.filter((call) => (call.performance || 1) > 1);
    const winRate =
      calls.length > 0 ? (winningCalls.length / calls.length) * 100 : 0;
    const avgPerformance =
      calls.length > 0
        ? calls.reduce((sum, call) => sum + (call.performance || 1), 0) /
          calls.length
        : 1;
    const bestPerformance = Math.max(
      ...calls.map((call) => call.performance || 1)
    );
    const worstPerformance = Math.min(
      ...calls.map((call) => call.performance || 1)
    );

    return {
      chat_id: chatId,
      title: data.title || "Unknown Group",
      username: data.username,
      member_count: data.member_count || 0,
      description: data.description,
      photo: data.photo,
      calls: calls,
      stats: {
        total_calls: calls.length,
        win_rate: winRate,
        avg_performance: avgPerformance,
        best_performance: bestPerformance,
        worst_performance: worstPerformance,
      },
    };
  } catch (error) {
    console.error("Error fetching Telegram data:", error);
    return null;
  }
}

// Fetch multiple token prices in batch
export async function fetchBatchTokenPrices(
  contracts: string[]
): Promise<Record<string, RealTokenData>> {
  const results: Record<string, RealTokenData> = {};

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < contracts.length; i += batchSize) {
    const batch = contracts.slice(i, i + batchSize);

    const promises = batch.map(async (contract) => {
      const data = await fetchRealTokenData(contract);
      if (data) {
        results[contract] = data;
      }
    });

    await Promise.all(promises);

    // Add delay between batches
    if (i + batchSize < contracts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Get real-time price updates
export async function subscribeToRealTimeUpdates(
  contracts: string[],
  callback: (updates: Record<string, RealTokenData>) => void
) {
  // This would typically use WebSocket connections to DexScreener or similar
  const interval = setInterval(async () => {
    const updates = await fetchBatchTokenPrices(contracts);
    callback(updates);
  }, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
}
