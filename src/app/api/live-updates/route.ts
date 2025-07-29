import { type NextRequest, NextResponse } from "next/server";

// WebSocket-like endpoint for live price updates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contracts = searchParams.get("contracts")?.split(",") || [];

  if (contracts.length === 0) {
    return NextResponse.json(
      { error: "No contracts provided" },
      { status: 400 }
    );
  }

  try {
    console.log(`🔴 LIVE UPDATE for ${contracts.length} tokens`);

    // Fetch live prices in parallel
    const pricePromises = contracts.map(async (contract) => {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${contract}`,
          {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; TokenBot/1.0)" },
            signal: AbortSignal.timeout(2000),
          }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.pairs || data.pairs.length === 0) return null;

        const pair = data.pairs[0];
        return {
          contract,
          price_usd: Number.parseFloat(pair.priceUsd || "0"),
          price_change_5m: Number.parseFloat(pair.priceChange?.m5 || "0"),
          volume_5m: Number.parseFloat(pair.volume?.m5 || "0"),
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.allSettled(pricePromises);
    const liveUpdates = results
      .filter((result) => result.status === "fulfilled" && result.value)
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    return NextResponse.json({
      updates: liveUpdates,
      timestamp: new Date().toISOString(),
      count: liveUpdates.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Live update failed" }, { status: 500 });
  }
}
