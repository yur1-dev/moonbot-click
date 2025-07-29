// Helper functions for API calls with better error handling

export async function fetchGroupCalls(
  groupName: string,
  username?: string,
  timeframe = "24h"
) {
  try {
    const params = new URLSearchParams({
      group: groupName,
      timeframe,
    });

    if (username) {
      params.append("username", username);
    }

    // Fix the API path - it should be /api/telegram/group-calls
    const apiUrl = `/api/telegram/group-calls?${params}`;
    console.log(`🔍 Fetching calls from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ API Error ${response.status}:`,
        errorText.substring(0, 200)
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success && data.error) {
      console.warn(`⚠️ API warning for ${groupName}:`, data.error);
      // Still return the data since we have fallback mock data
    }

    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch calls for ${groupName}:`, error);

    // Return mock data structure on complete failure
    return {
      success: false,
      calls: [],
      error: error instanceof Error ? error.message : "Network error",
      method: "error_fallback",
    };
  }
}

export async function fetchNewTokenData(
  groupName: string,
  username?: string,
  timeframe = "24h"
) {
  try {
    console.log(`🔍 Fetching token data for: ${groupName}`);

    const callsData = await fetchGroupCalls(groupName, username, timeframe);

    if (callsData.calls && callsData.calls.length > 0) {
      // Process the calls data into token format
      const tokenData = callsData.calls.map((call: any) => ({
        symbol: call.token,
        change: call.result,
        timestamp: call.date,
        status: call.status,
      }));

      return {
        success: true,
        tokens: tokenData,
        group: groupName,
        timeframe,
      };
    }

    return {
      success: false,
      tokens: [],
      error: "No token data available",
    };
  } catch (error) {
    console.error(`❌ Token data error for ${groupName}:`, error);

    // Return empty data instead of throwing
    return {
      success: false,
      tokens: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchLiveCalls(groupName: string, username?: string) {
  try {
    const params = new URLSearchParams({
      group: groupName,
    });

    if (username) {
      params.append("username", username);
    }

    // Fix the API path
    const apiUrl = `/api/telegram/live-calls?${params}`;
    console.log(`🔍 Fetching live calls from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch live calls for ${groupName}:`, error);

    // Return mock data structure
    return {
      success: false,
      calls: [],
      error: error instanceof Error ? error.message : "Network error",
      method: "error_fallback",
    };
  }
}
