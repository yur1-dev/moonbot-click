import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // For now, return dummy data in the correct format
    // Replace this with your actual API call to https://api.moonbot.click/api/chats
    const dummyData = Array.from({ length: 5 }).map((_, idx) => ({
      rank: idx + 1,
      name: [
        "Tether USA",
        "RockingGo IND",
        "Birdmanly RUS",
        "Forces88 JAP",
        "RambledMonkey CAN",
      ][idx],
      members: 125,
      launched: 4,
      avgPump: "3.15x",
      best: "$XRP +8.14%",
      worst: "$ETH -0.14%",
    }));

    // If you want to proxy to external API, uncomment this:
    /*
    const response = await fetch("https://api.moonbot.click/api/chats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any required headers/auth
      },
    })
    
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`)
    }
    
    const externalData = await response.json()
    return NextResponse.json(externalData)
    */

    return NextResponse.json(dummyData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to your external API
    const response = await fetch("https://api.moonbot.click/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any required headers
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
