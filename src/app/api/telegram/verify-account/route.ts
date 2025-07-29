import { type NextRequest, NextResponse } from "next/server";

// Manual verification endpoint for testing specific groups
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const cleanUsername = username.replace("@", "");
    console.log(`🔍 Manual verification for: ${cleanUsername}`);

    // Try direct scraping with detailed logging
    const response = await fetch(`https://t.me/s/${cleanUsername}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(
      `📊 Response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        username: cleanUsername,
      });
    }

    const html = await response.text();
    console.log(`📄 HTML length: ${html.length}`);

    // Extract and return detailed information
    const memberPatterns = [
      /(\d+(?:[\s,]\d+)*)\s*(?:members|subscribers)/gi,
      /<span class="counter_value">(\d+(?:[\s,]\d+)*)<\/span>/gi,
      /(\d+(?:\.\d+)?[KMB])\s*(?:members|subscribers)/gi,
    ];

    const foundMatches: string[] = [];
    let memberCount: number | null = null;

    for (const pattern of memberPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        foundMatches.push(match[0]);
        if (!memberCount) {
          const numStr = match[1];
          if (numStr.includes("K")) {
            memberCount = Math.floor(
              Number.parseFloat(numStr.replace("K", "")) * 1000
            );
          } else if (numStr.includes("M")) {
            memberCount = Math.floor(
              Number.parseFloat(numStr.replace("M", "")) * 1000000
            );
          } else {
            memberCount = Number.parseInt(numStr.replace(/[\s,]/g, ""));
          }
        }
      }
    }

    // Also check for specific page elements
    const hasValidPage =
      html.includes("tgme_page") || html.includes("tgme_channel");
    const pageTitle =
      html.match(/<title>([^<]+)<\/title>/)?.[1] || "No title found";

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      member_count: memberCount,
      found_matches: foundMatches,
      has_valid_page: hasValidPage,
      page_title: pageTitle,
      html_sample: html.substring(0, 1000),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Verification error for ${username}:`, error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      username: username,
      timestamp: new Date().toISOString(),
    });
  }
}
