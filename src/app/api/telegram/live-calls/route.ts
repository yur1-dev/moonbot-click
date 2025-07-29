import { type NextRequest, NextResponse } from "next/server";

interface TokenCall {
  token: string;
  contract?: string;
  platform: string;
  timestamp: string;
  group: string;
  username?: string;
  message_link?: string;
  price?: string;
  market_cap?: string;
  message_text?: string;
  confidence: "high" | "medium" | "low";
}

// REAL-TIME token extraction from live Telegram messages
async function extractLiveTokensFromTelegram(
  username: string,
  groupName: string
): Promise<TokenCall[]> {
  try {
    const cleanUsername = username.replace("@", "");
    console.log(`🔴 LIVE TOKEN EXTRACTION for: ${cleanUsername}`);

    const response = await fetch(`https://t.me/s/${cleanUsername}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.log(
        `❌ Failed to fetch live data from ${cleanUsername}: HTTP ${response.status}`
      );
      return [];
    }

    const html = await response.text();
    console.log(`📄 Fetched ${html.length} characters of live HTML`);

    // Extract the most recent messages (last 10)
    const messagePattern =
      /<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)<\/div>/;
    const timePattern = /<time[^>]*datetime="([^"]*)"[^>]*>/g;

    const messages: Array<{ text: string; time?: string }> = [];
    let messageMatch;
    let timeMatch;

    // Get timestamps first
    const timestamps: string[] = [];
    while ((timeMatch = timePattern.exec(html)) !== null) {
      timestamps.push(timeMatch[1]);
    }

    // Get messages
    while (
      (messageMatch = messagePattern.exec(html)) !== null &&
      messages.length < 10
    ) {
      const messageText = messageMatch[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (messageText.length > 10) {
        messages.push({
          text: messageText,
          time: timestamps[messages.length] || new Date().toISOString(),
        });
      }
    }

    console.log(`📨 Extracted ${messages.length} recent messages`);

    if (messages.length === 0) {
      console.log(`⚠️ No recent messages found`);
      return [];
    }

    // Extract REAL tokens from recent messages
    const liveTokens: TokenCall[] = [];

    messages.forEach((message, index) => {
      const tokens = extractLiveTokensFromMessage(
        message.text,
        message.time || new Date().toISOString(),
        groupName,
        username
      );
      liveTokens.push(...tokens);
    });

    // Remove duplicates and sort by timestamp
    const uniqueTokens = liveTokens
      .filter(
        (token, index, self) =>
          index ===
          self.findIndex(
            (t) => t.token === token.token && t.contract === token.contract
          )
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    console.log(
      `✅ Extracted ${uniqueTokens.length} LIVE tokens from ${cleanUsername}`
    );

    // Log examples
    uniqueTokens.slice(0, 3).forEach((token) => {
      console.log(
        `🔴 LIVE: ${token.token} (${
          token.confidence
        }) - "${token.message_text?.substring(0, 40)}..."`
      );
    });

    return uniqueTokens.slice(0, 10); // Return top 10 most recent
  } catch (error) {
    console.error(`❌ Live token extraction failed for ${username}:`, error);
    return [];
  }
}

// Extract live tokens from individual message
function extractLiveTokensFromMessage(
  messageText: string,
  timestamp: string,
  groupName: string,
  username?: string
): TokenCall[] {
  const tokens: TokenCall[] = [];

  console.log(`🔍 LIVE analysis: "${messageText.substring(0, 80)}..."`);

  // HIGH CONFIDENCE: $TOKEN format
  const tokenPattern = /\$([A-Z]{2,10})\b/gi;
  let match;
  while ((match = tokenPattern.exec(messageText)) !== null) {
    const token = `$${match[1]}`;

    tokens.push({
      token,
      platform: "unknown",
      timestamp,
      group: groupName,
      username,
      message_text: messageText.substring(0, 150),
      confidence: "high",
    });

    console.log(`🎯 HIGH confidence token: ${token}`);
  }

  // HIGH CONFIDENCE: Solana contract addresses
  const solanaContractPattern = /([1-9A-HJ-NP-Za-km-z]{32,44})/g;
  while ((match = solanaContractPattern.exec(messageText)) !== null) {
    const contract = match[1];

    // Verify it looks like a Solana address
    if (
      contract.length >= 32 &&
      contract.length <= 44 &&
      !/[0OIl]/.test(contract)
    ) {
      tokens.push({
        token: `${contract.substring(0, 8)}...`,
        contract,
        platform: "solana",
        timestamp,
        group: groupName,
        username,
        message_text: messageText.substring(0, 150),
        confidence: "high",
      });

      console.log(
        `🎯 HIGH confidence Solana contract: ${contract.substring(0, 12)}...`
      );
    }
  }

  // HIGH CONFIDENCE: Ethereum contract addresses
  const ethContractPattern = /(0x[a-fA-F0-9]{40})/g;
  while ((match = ethContractPattern.exec(messageText)) !== null) {
    const contract = match[1];

    tokens.push({
      token: `${contract.substring(0, 10)}...`,
      contract,
      platform: "ethereum",
      timestamp,
      group: groupName,
      username,
      message_text: messageText.substring(0, 150),
      confidence: "high",
    });

    console.log(
      `🎯 HIGH confidence Ethereum contract: ${contract.substring(0, 12)}...`
    );
  }

  // MEDIUM CONFIDENCE: DEX Screener links
  const dexScreenerPattern = /dexscreener\.com\/([a-z]+)\/([A-Za-z0-9]+)/gi;
  while ((match = dexScreenerPattern.exec(messageText)) !== null) {
    const platform = match[1];
    const address = match[2];

    tokens.push({
      token: `DEX:${address.substring(0, 8)}...`,
      contract: address,
      platform,
      timestamp,
      group: groupName,
      username,
      message_link: `https://dexscreener.com/${platform}/${address}`,
      message_text: messageText.substring(0, 150),
      confidence: "medium",
    });

    console.log(
      `🎯 MEDIUM confidence DEX link: ${platform}/${address.substring(
        0,
        12
      )}...`
    );
  }

  // MEDIUM CONFIDENCE: Pump.fun links
  const pumpFunPattern = /pump\.fun\/([A-Za-z0-9]+)/gi;
  while ((match = pumpFunPattern.exec(messageText)) !== null) {
    const address = match[1];

    tokens.push({
      token: `PUMP:${address.substring(0, 8)}...`,
      contract: address,
      platform: "solana",
      timestamp,
      group: groupName,
      username,
      message_link: `https://pump.fun/${address}`,
      message_text: messageText.substring(0, 150),
      confidence: "medium",
    });

    console.log(
      `🎯 MEDIUM confidence Pump.fun: ${address.substring(0, 12)}...`
    );
  }

  // LOW CONFIDENCE: Token-like words in context
  const contextPattern =
    /\b([A-Z]{3,8})\b(?=.*(?:buy|sell|pump|moon|gem|call))/gi;
  while ((match = contextPattern.exec(messageText)) !== null) {
    const tokenName = match[1];

    // Skip common words
    if (
      ![
        "THE",
        "AND",
        "FOR",
        "YOU",
        "ARE",
        "NOT",
        "BUT",
        "CAN",
        "ALL",
        "NEW",
        "GET",
        "NOW",
        "OUT",
        "TOP",
      ].includes(tokenName)
    ) {
      tokens.push({
        token: `$${tokenName}`,
        platform: "unknown",
        timestamp,
        group: groupName,
        username,
        message_text: messageText.substring(0, 150),
        confidence: "low",
      });

      console.log(`🎯 LOW confidence token: $${tokenName}`);
    }
  }

  return tokens;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupName = searchParams.get("group");
  const username = searchParams.get("username");

  if (!groupName && !username) {
    return NextResponse.json(
      {
        success: false,
        error: "Group name or username required",
        calls: [],
      },
      { status: 400 }
    );
  }

  try {
    console.log(`🔴 LIVE TOKEN EXTRACTION for: ${groupName || username}`);

    let calls: TokenCall[] = [];

    // Try to extract REAL live tokens
    if (username) {
      console.log(`🌐 Extracting LIVE tokens from @${username}`);
      calls = await extractLiveTokensFromTelegram(
        username,
        groupName || "Unknown Group"
      );
    }

    if (calls.length === 0) {
      console.log(`⚠️ No live tokens found - this could mean:`);
      console.log(`   1. No recent messages with tokens`);
      console.log(`   2. Channel is private/restricted`);
      console.log(`   3. Different token format than expected`);

      return NextResponse.json({
        success: false,
        calls: [],
        error: "No live tokens found in recent messages",
        details: "No recent token activity or channel is restricted",
        method: "live_extraction_failed",
        group: groupName,
        username,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`✅ Successfully extracted ${calls.length} LIVE tokens`);

    return NextResponse.json({
      success: true,
      calls,
      group: groupName,
      username,
      timestamp: new Date().toISOString(),
      method: "live_real_extraction",
      extracted_count: calls.length,
    });
  } catch (error) {
    console.error("❌ Live token extraction error:", error);

    return NextResponse.json({
      success: false,
      calls: [],
      error: "Failed to extract live tokens from Telegram",
      details: error instanceof Error ? error.message : "Unknown error",
      method: "live_extraction_error",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { groups } = await request.json();

    if (!Array.isArray(groups)) {
      return NextResponse.json(
        { error: "Groups array required" },
        { status: 400 }
      );
    }

    console.log(`🔴 LIVE TOKEN EXTRACTION for ${groups.length} groups`);

    const results = await Promise.all(
      groups.map(async (group: any) => {
        try {
          let calls: TokenCall[] = [];

          // Try to extract REAL live tokens
          if (group.username) {
            console.log(`🌐 Extracting live tokens from @${group.username}`);
            calls = await extractLiveTokensFromTelegram(
              group.username,
              group.title || group.name
            );
          }

          return {
            group_id: group.chat_id || group.id,
            group_name: group.title || group.name,
            username: group.username,
            calls,
            success: calls.length > 0,
            method:
              calls.length > 0 ? "live_real_extraction" : "no_live_tokens",
          };
        } catch (error) {
          console.error(
            `❌ Error extracting live tokens from ${group.title}:`,
            error
          );

          return {
            group_id: group.chat_id || group.id,
            group_name: group.title || group.name,
            username: group.username,
            calls: [],
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            method: "live_extraction_failed",
          };
        }
      })
    );

    const successfulExtractions = results.filter((r) => r.success).length;
    const totalLiveTokens = results.reduce((sum, r) => sum + r.calls.length, 0);

    console.log(
      `✅ Successfully extracted live tokens from ${successfulExtractions}/${groups.length} groups`
    );
    console.log(`🔴 Total live tokens found: ${totalLiveTokens}`);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      successful_extractions: successfulExtractions,
      total_live_tokens: totalLiveTokens,
      method: "batch_live_real_extraction",
    });
  } catch (error) {
    console.error("❌ Batch live token extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract live tokens from groups",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
