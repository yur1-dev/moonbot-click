"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string) => {
    setLoading(true);
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      setResults({ endpoint, status: response.status, data });
      console.log("Result:", data);
    } catch (error) {
      setResults({
        endpoint,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() =>
              testAPI(
                "/api/telegram/verify-count?username=InfinityGainzAnnouncer"
              )
            }
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Test Member Count
          </Button>

          <Button
            onClick={() =>
              testAPI(
                "/api/telegram/live-calls?group=InfinityGainz Announcer&username=InfinityGainzAnnouncer"
              )
            }
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Test Live Calls
          </Button>

          <Button
            onClick={() =>
              testAPI(
                "/api/telegram/group-calls?group=InfinityGainz Announcer&timeframe=24h"
              )
            }
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Test Group Calls
          </Button>

          <Button
            onClick={() => testAPI("https://api.moonbot.click/api/chats")}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Test External API
          </Button>
        </div>

        {results && (
          <Card className="bg-[#151A2C] text-white border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>API Test Results</span>
                <Badge
                  className={results.error ? "bg-red-600" : "bg-green-600"}
                >
                  {results.error ? "Error" : `${results.status}`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Endpoint</p>
                  <p className="font-mono text-sm">{results.endpoint}</p>
                </div>

                {results.error ? (
                  <div>
                    <p className="text-sm text-gray-400">Error</p>
                    <p className="text-red-400">{results.error}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-400">Response Data</p>
                    <pre className="bg-[#1A2137] p-4 rounded text-xs overflow-x-auto">
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-400">Testing API...</div>
          </div>
        )}
      </div>
    </div>
  );
}
