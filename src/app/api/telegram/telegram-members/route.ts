import { type NextRequest, NextResponse } from "next/server";

// Real implementation to fetch actual Telegram group calls
async function fetchRealGroupCalls(groupId: string) {
  try {
    console.log(`🔥 Fetching REAL calls from group: ${groupId}`);

    // This would connect to actual Telegram API
    // For now, we'll use moonbot API as the source of truth
    const response = await fetch(
      `https://api.moonbot.click/api/chats/${groupId}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group data: ${response.status}`);
    }

    const data = await response.json();
    const realCalls = [];

    // Process messages to extract REAL token calls
    for (const message of data.messages || []) {
      const messageText = message.text || "";

      // Extract Solana contract addresses
      const contractMatches = messageText.match(
        /([1-9A-HJ-NP-Za-km-z]{32,44})/g
      );
      const symbolMatches = messageText.match(/\$([A-Z]{2,10})/g);

      if (contractMatches || symbolMatches) {
        for (const contract of contractMatches || []) {
          // Fetch REAL token data for each contract found
          try {
            const tokenResponse = await fetch(
              `https://api.dexscreener.com/latest/dex/tokens/${contract}`
            );
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              if (tokenData.pairs && tokenData.pairs.length > 0) {
                const pair = tokenData.pairs[0];

                realCalls.push({
                  message_id: message.id,
                  contract: contract,
                  symbol: pair.baseToken.symbol,
                  name: pair.baseToken.name,
                  price_usd: Number.parseFloat(pair.priceUsd || "0"),
                  market_cap: Number.parseFloat(pair.marketCap || "0"),
                  volume_24h: Number.parseFloat(pair.volume?.h24 || "0"),
                  price_change_24h: Number.parseFloat(
                    pair.priceChange?.h24 || "0"
                  ),
                  caller:
                    message.from?.first_name ||
                    message.from?.username ||
                    "Anonymous",
                  timestamp: message.date,
                  message: messageText,
                  group_name: data.title,
                  is_real: true, // Mark as REAL data
                });
              }
            }
          } catch (error) {
            console.error(`Failed to fetch token data for ${contract}:`, error);
          }
        }
      }
    }

    console.log(`✅ Found ${realCalls.length} REAL token calls`);
    return realCalls;
  } catch (error) {
    console.error("Error fetching real group calls:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "Group ID required" }, { status: 400 });
  }

  try {
    const realCalls = await fetchRealGroupCalls(groupId);

    return NextResponse.json({
      group_id: groupId,
      total_calls: realCalls.length,
      calls: realCalls,
      last_updated: new Date().toISOString(),
      is_real_data: true,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch real group calls" },
      { status: 500 }
    );
  }
}
