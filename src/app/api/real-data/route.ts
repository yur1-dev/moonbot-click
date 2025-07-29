import { type NextRequest, NextResponse } from "next/server";

// Database interface for token calls
interface TokenCall {
  id: string;
  messageId: number;
  chatId: string;
  chatTitle: string;
  chatUsername?: string;
  callerName: string;
  callerUsername?: string;
  messageText: string;
  contracts: string[];
  timestamp: string;
  tokenData?: {
    symbol: string;
    name: string;
    price_usd: number;
    market_cap: number;
    volume_24h: number;
    price_change_24h: number;
  };
}

// Mock database - replace with your actual database
const tokenCallsDB: TokenCall[] = [];

// Fetch token data from DexScreener
async function fetchTokenData(contract: string) {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${contract}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    const pair = data.pairs[0];
    return {
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      price_usd: Number.parseFloat(pair.priceUsd || "0"),
      market_cap: Number.parseFloat(pair.marketCap || "0"),
      volume_24h: Number.parseFloat(pair.volume?.h24 || "0"),
      price_change_24h: Number.parseFloat(pair.priceChange?.h24 || "0"),
      liquidity: Number.parseFloat(pair.liquidity?.usd || "0"),
      buys_24h: Number.parseInt(pair.txns?.h24?.buys || "0"),
      sells_24h: Number.parseInt(pair.txns?.h24?.sells || "0"),
      created_at: pair.pairCreatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to fetch token data for ${contract}:`, error);
    return null;
  }
}

// Get historical token calls with timeframe filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  const timeframe = searchParams.get("timeframe") || "24h";

  try {
    // Calculate time range
    const now = new Date();
    let startTime: Date;

    switch (timeframe) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Filter token calls by chat and timeframe
    let filteredCalls = tokenCallsDB.filter((call) => {
      const callTime = new Date(call.timestamp);
      const matchesChat = !chatId || call.chatId === chatId;
      const matchesTime = callTime >= startTime;
      return matchesChat && matchesTime;
    });

    // If no real data, generate some realistic sample data
    if (filteredCalls.length === 0) {
      filteredCalls = await generateSampleTokenCalls(chatId, timeframe);
    }

    // Enrich with current token data
    const enrichedCalls = await Promise.all(
      filteredCalls.map(async (call) => {
        const enrichedContracts = await Promise.all(
          call.contracts.map(async (contract) => {
            const tokenData = await fetchTokenData(contract);
            return {
              contract,
              tokenData,
            };
          })
        );

        return {
          ...call,
          enrichedContracts,
        };
      })
    );

    return NextResponse.json({
      chatId,
      timeframe,
      totalCalls: enrichedCalls.length,
      calls: enrichedCalls,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching realtime tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch token calls" },
      { status: 500 }
    );
  }
}

// Generate sample data for demonstration
async function generateSampleTokenCalls(
  chatId: string | null,
  timeframe: string
): Promise<TokenCall[]> {
  const sampleContracts = [
    "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
  ];

  const sampleGroups = [
    { id: "MajorTrending", title: "Major Livestream & Community Chat" },
    { id: "AlphaCalls", title: "Alpha Calls Premium" },
    { id: "GemFinders", title: "Gem Finders VIP" },
    { id: "MoonHunters", title: "Moon Hunters Elite" },
  ];

  const now = new Date();
  const calls: TokenCall[] = [];

  // Generate calls based on timeframe
  const callCount =
    timeframe === "1h"
      ? 5
      : timeframe === "24h"
      ? 20
      : timeframe === "7d"
      ? 50
      : 100;
  const timeRange =
    timeframe === "1h"
      ? 60 * 60 * 1000
      : timeframe === "24h"
      ? 24 * 60 * 60 * 1000
      : timeframe === "7d"
      ? 7 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < callCount; i++) {
    const group = sampleGroups[Math.floor(Math.random() * sampleGroups.length)];
    const contract =
      sampleContracts[Math.floor(Math.random() * sampleContracts.length)];
    const timestamp = new Date(now.getTime() - Math.random() * timeRange);

    if (!chatId || group.id === chatId) {
      calls.push({
        id: `${Date.now()}-${i}`,
        messageId: Date.now() + i,
        chatId: group.id,
        chatTitle: group.title,
        chatUsername: group.id,
        callerName: `Caller${i + 1}`,
        callerUsername: `caller${i + 1}`,
        messageText: `🚀 NEW GEM ALERT! Contract: ${contract} This is going to moon! 🌙`,
        contracts: [contract],
        timestamp: timestamp.toISOString(),
      });
    }
  }

  return calls.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Store new token call
export async function POST(request: NextRequest) {
  try {
    const tokenCall: TokenCall = await request.json();

    // Add to mock database
    tokenCallsDB.push({
      ...tokenCall,
      id: `${Date.now()}-${Math.random()}`,
    });

    // In a real implementation, save to your database
    console.log("Stored new token call:", tokenCall);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing token call:", error);
    return NextResponse.json(
      { error: "Failed to store token call" },
      { status: 500 }
    );
  }
}
