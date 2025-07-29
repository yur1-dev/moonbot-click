"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  MessageCircle,
  ExternalLink,
  Copy,
  Zap,
} from "lucide-react";

interface RealtimeTokenCall {
  id: string;
  messageId: number;
  chatId: string;
  chatTitle: string;
  chatUsername?: string;
  callerName: string;
  messageText: string;
  contracts: string[];
  timestamp: string;
  enrichedContracts: Array<{
    contract: string;
    tokenData?: {
      symbol: string;
      name: string;
      price_usd: number;
      market_cap: number;
      volume_24h: number;
      price_change_24h: number;
      liquidity: number;
      buys_24h: number;
      sells_24h: number;
      created_at: string;
    };
  }>;
}

interface RealtimeTokenFeedProps {
  chatId?: string;
  timeframe?: string;
  maxItems?: number;
}

export default function RealtimeTokenFeed({
  chatId,
  timeframe = "24h",
  maxItems = 20,
}: RealtimeTokenFeedProps) {
  const [tokenCalls, setTokenCalls] = useState<RealtimeTokenCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial data
  const fetchTokenCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeframe,
        ...(chatId && { chatId }),
      });

      const response = await fetch(`/api/realtime-tokens?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTokenCalls(data.calls.slice(0, maxItems));
    } catch (err) {
      console.error("Failed to fetch token calls:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket for real-time updates
  const setupWebSocket = () => {
    try {
      // In a real implementation, you'd connect to your WebSocket server
      // For now, we'll simulate with periodic updates
      const interval = setInterval(() => {
        fetchTokenCalls();
      }, 30000); // Update every 30 seconds

      setIsLive(true);

      return () => {
        clearInterval(interval);
        setIsLive(false);
      };
    } catch (error) {
      console.error("WebSocket setup failed:", error);
      setIsLive(false);
    }
  };

  useEffect(() => {
    fetchTokenCalls();
    const cleanup = setupWebSocket();

    return cleanup;
  }, [chatId, timeframe]);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toExponential(4);
    return price.toFixed(8);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const callTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - callTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const copyContract = (contract: string) => {
    navigator.clipboard.writeText(contract);
  };

  if (loading) {
    return (
      <Card className="bg-[#151A2C] border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">
              🔥 Loading real-time token calls...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#151A2C] border-gray-700">
        <CardContent className="p-6">
          <div className="text-red-400 text-center py-8">❌ Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#151A2C] border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span>Real-Time Token Feed</span>
            {isLive && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Badge className="bg-green-600">LIVE</Badge>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {timeframe.toUpperCase()}
            </Badge>
            <Badge className="bg-blue-600">{tokenCalls.length} calls</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tokenCalls.map((call) => (
          <div
            key={call.id}
            className="bg-[#1A2137] rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://t.me/i/userpic/320/${call.chatId}.jpg`}
                    alt={call.chatTitle}
                  />
                  <AvatarFallback className="bg-[#0F1419] text-white">
                    {call.chatTitle.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-white">
                    {call.chatTitle}
                  </div>
                  <div className="text-sm text-gray-400">
                    by {call.callerName}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{getTimeAgo(call.timestamp)}</span>
              </div>
            </div>

            <div className="bg-[#0F1419] rounded p-3 mb-4">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {call.messageText}
              </p>
            </div>

            {call.enrichedContracts.map((enriched, index) => (
              <div
                key={enriched.contract}
                className="bg-[#0F1419] rounded-lg p-4 mb-3"
              >
                {enriched.tokenData ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          ${enriched.tokenData.symbol}
                        </h3>
                        <p className="text-gray-400">
                          {enriched.tokenData.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {enriched.tokenData.price_change_24h > 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                          <span
                            className={`text-xl font-bold ${
                              enriched.tokenData.price_change_24h > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {enriched.tokenData.price_change_24h > 0 ? "+" : ""}
                            {enriched.tokenData.price_change_24h.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-gray-400">
                          ${formatPrice(enriched.tokenData.price_usd)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-[#1A2137] p-2 rounded">
                        <p className="text-xs text-gray-400">Market Cap</p>
                        <p className="text-white font-semibold">
                          ${formatNumber(enriched.tokenData.market_cap)}
                        </p>
                      </div>
                      <div className="bg-[#1A2137] p-2 rounded">
                        <p className="text-xs text-gray-400">24h Volume</p>
                        <p className="text-white font-semibold">
                          ${formatNumber(enriched.tokenData.volume_24h)}
                        </p>
                      </div>
                      <div className="bg-[#1A2137] p-2 rounded">
                        <p className="text-xs text-gray-400">Liquidity</p>
                        <p className="text-white font-semibold">
                          ${formatNumber(enriched.tokenData.liquidity)}
                        </p>
                      </div>
                      <div className="bg-[#1A2137] p-2 rounded">
                        <p className="text-xs text-gray-400">24h Txns</p>
                        <p className="text-white font-semibold">
                          <span className="text-green-400">
                            {enriched.tokenData.buys_24h}B
                          </span>{" "}
                          /{" "}
                          <span className="text-red-400">
                            {enriched.tokenData.sells_24h}S
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Loading token data...</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {enriched.contract.slice(0, 8)}...
                      {enriched.contract.slice(-6)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                      onClick={() => copyContract(enriched.contract)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        window.open(
                          `https://dexscreener.com/solana/${enriched.contract}`,
                          "_blank"
                        )
                      }
                    >
                      📊 Chart
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() =>
                        window.open(
                          `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${enriched.contract}`,
                          "_blank"
                        )
                      }
                    >
                      💰 Trade
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 border-t border-gray-600">
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300"
                onClick={() =>
                  window.open(`https://t.me/${call.chatUsername}`, "_blank")
                }
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Join Group
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() =>
                  window.open(
                    `/group/${encodeURIComponent(call.chatId)}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        ))}

        {tokenCalls.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No token calls found for this timeframe.
            {isLive && " Waiting for new calls..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
