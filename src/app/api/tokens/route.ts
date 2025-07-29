import { type NextRequest, NextResponse } from "next/server";

interface TokenCall {
  token: string;
  contract?: string;
  platform: string;
  timestamp: string;
  message_text: string;
  confidence: "high" | "medium" | "low";
}

// Extract tokens from Telegram channel
async function extractTokensFromChannel(
  username: string
): Promise<TokenCall[]> {
  const cleanUsername = username.replace("@", "");
  console.log(`🪙 Extracting tokens from: ${cleanUsername}`);

  try {
    const response = await fetch(`https://t.me/s/${cleanUsername}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`❌ Failed to fetch ${cleanUsername}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    console.log(`📄 Processing ${html.length} chars from ${cleanUsername}`);

    // Extract messages
    const messagePattern =
      /<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)<\/div>/;
    const timePattern = /<time[^>]*datetime="([^"]*)"[^>]*>/g;

    const messages: Array<{ content: string; timestamp: string }> = [];
    const timestamps: string[] = [];

    // Get timestamps
    let timeMatch;
    while ((timeMatch = timePattern.exec(html)) !== null) {
      timestamps.push(timeMatch[1]);
    }

    // Get messages
    let messageMatch;
    let messageIndex = 0;
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

      if (messageText.length > 20) {
        messages.push({
          content: messageText,
          timestamp: timestamps[messageIndex] || new Date().toISOString(),
        });
        messageIndex++;
      }
    }

    console.log(`📨 Found ${messages.length} messages`);

    // Extract tokens from messages
    const allTokens: TokenCall[] = [];

    messages.forEach((message) => {
      const tokens = extractTokensFromMessage(
        message.content,
        message.timestamp
      );
      allTokens.push(...tokens);
    });

    // Remove duplicates
    const uniqueTokens = allTokens.filter(
      (token, index, self) =>
        index === self.findIndex((t) => t.token === token.token)
    );

    console.log(`✅ Found ${uniqueTokens.length} unique tokens`);
    return uniqueTokens.slice(0, 10);
  } catch (error) {
    console.error(`❌ Token extraction failed for ${cleanUsername}:`, error);
    return [];
  }
}

// Extract tokens from message text
function extractTokensFromMessage(
  messageText: string,
  timestamp: string
): TokenCall[] {
  const tokens: TokenCall[] = [];

  // Pattern 1: $TOKEN format
  const tokenPattern = /\$([A-Z]{2,10})\b/gi;
  let match;
  while ((match = tokenPattern.exec(messageText)) !== null) {
    tokens.push({
      token: `$${match[1]}`,
      platform: "unknown",
      timestamp,
      message_text: messageText.substring(0, 100),
      confidence: "high",
    });
  }

  // Pattern 2: Solana addresses
  const solanaPattern = /([1-9A-HJ-NP-Za-km-z]{32,44})/g;
  while ((match = solanaPattern.exec(messageText)) !== null) {
    const contract = match[1];
    if (contract.length >= 32 && contract.length <= 44) {
      tokens.push({
        token: `${contract.substring(0, 8)}...`,
        contract,
        platform: "solana",
        timestamp,
        message_text: messageText.substring(0, 100),
        confidence: "high",
      });
    }
  }

  // Pattern 3: Ethereum addresses
  const ethPattern = /(0x[a-fA-F0-9]{40})/g;
  while ((match = ethPattern.exec(messageText)) !== null) {
    tokens.push({
      token: `${match[1].substring(0, 10)}...`,
      contract: match[1],
      platform: "ethereum",
      timestamp,
      message_text: messageText.substring(0, 100),
      confidence: "high",
    });
  }

  return tokens;
}

// Single channel endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const tokens = await extractTokensFromChannel(username);

    return NextResponse.json({
      success: true,
      tokens,
      count: tokens.length,
      username,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      username,
      timestamp: new Date().toISOString(),
    });
  }
}

// Batch token extraction
export async function POST(request: NextRequest) {
  try {
    const { usernames } = await request.json();

    if (!Array.isArray(usernames)) {
      return NextResponse.json(
        { error: "Usernames array required" },
        { status: 400 }
      );
    }

    console.log(
      `🪙 Batch token extraction for ${usernames.length} channels...`
    );

    const results = await Promise.all(
      usernames.map(async (username: string) => {
        const tokens = await extractTokensFromChannel(username);
        return {
          username,
          success: tokens.length > 0,
          tokens,
          count: tokens.length,
          timestamp: new Date().toISOString(),
        };
      })
    );

    const successful = results.filter((r) => r.success).length;
    const totalTokens = results.reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      success: true,
      results,
      total_channels: usernames.length,
      successful_channels: successful,
      total_tokens: totalTokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Batch token extraction error:", error);
    return NextResponse.json(
      {
        error: "Batch token extraction failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
