"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Star,
  StarOff,
  MessageCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Calendar,
  Zap,
  Globe,
  Twitter,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NewTokenCall {
  message_id: number;
  contract: string;
  symbol: string;
  name: string;
  price_usd: number;
  market_cap: number;
  volume_24h: number;
  volume_1h: number;
  volume_5m: number;
  price_change_24h: number;
  price_change_1h: number;
  price_change_5m: number;
  liquidity: number;
  buys_24h: number;
  sells_24h: number;
  buys_1h: number;
  sells_1h: number;
  fdv: number;
  caller: string;
  timestamp: string;
  message: string;
  group_name: string;
  chart_url: string;
  trade_url: string;
  pump_url?: string;
  dex: string;
  pair_address?: string;
  created_at: string;
  is_new: boolean;
  is_pump_token: boolean;
  source: string;
  description?: string;
  image_uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  timeframe: string;
}

interface NewTokenGroupData {
  group_id: string;
  group_name: string;
  timeframe: string;
  total_calls: number;
  calls: NewTokenCall[];
  last_updated: string;
  is_real_data: boolean;
  data_sources: string[];
}

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [groupData, setGroupData] = useState<NewTokenGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("1d");

  const fetchNewTokenData = async (selectedTimeframe: string = timeframe) => {
    try {
      const groupIdParam = params?.id;
      if (!groupIdParam) {
        throw new Error("No group ID provided");
      }

      const groupId = decodeURIComponent(groupIdParam);
      console.log(
        "🔥 Fetching NEW token data for:",
        groupId,
        "timeframe:",
        selectedTimeframe
      );

      setLoading(true);
      setError(null);

      const apiUrl = `/api/tokens?groupId=${encodeURIComponent(
        groupId
      )}&timeframe=${selectedTimeframe}`;
      console.log("📡 Calling API:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TokenBot/1.0)",
        },
      });

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(`API Error ${response.status}: Failed to fetch data`);
      }

      const data = await response.json();
      console.log("✅ NEW token data received:", data);

      if (!data.calls || !Array.isArray(data.calls)) {
        throw new Error("Invalid data format received from API");
      }

      setGroupData(data);

      // Check if group is tracked
      try {
        const trackedGroups = JSON.parse(
          localStorage.getItem("trackedGroups") || "[]"
        );
        setIsTracking(trackedGroups.includes(groupId));
      } catch (storageError) {
        console.error("Error accessing localStorage:", storageError);
        setIsTracking(false);
      }
    } catch (err) {
      console.error("❌ Failed to fetch NEW token data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");

      // Set fallback data so page doesn't break
      const fallbackGroupId = params?.id
        ? decodeURIComponent(params.id)
        : "Unknown Group";
      setGroupData({
        group_id: fallbackGroupId,
        group_name: fallbackGroupId,
        timeframe: selectedTimeframe,
        total_calls: 0,
        calls: [],
        last_updated: new Date().toISOString(),
        is_real_data: false,
        data_sources: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchNewTokenData(timeframe);
    setRefreshing(false);
  };

  const handleTimeframeChange = async (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    await fetchNewTokenData(newTimeframe);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchNewTokenData();
  }, [params?.id]);

  const handleTrack = () => {
    if (!groupData) return;

    try {
      setIsTracking(!isTracking);
      const trackedGroups = JSON.parse(
        localStorage.getItem("trackedGroups") || "[]"
      );

      if (!isTracking) {
        if (!trackedGroups.includes(groupData.group_id)) {
          trackedGroups.push(groupData.group_id);
          localStorage.setItem("trackedGroups", JSON.stringify(trackedGroups));
        }
      } else {
        const filtered = trackedGroups.filter(
          (name: string) => name !== groupData.group_id
        );
        localStorage.setItem("trackedGroups", JSON.stringify(filtered));
      }
    } catch (error) {
      console.error("Failed to update tracking:", error);
    }
  };

  const copyContract = (contract: string) => {
    try {
      navigator.clipboard.writeText(contract);
    } catch (error) {
      console.error("Failed to copy contract:", error);
    }
  };

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
    try {
      const now = new Date();
      const callTime = new Date(timestamp);
      const diffInMinutes = Math.floor(
        (now.getTime() - callTime.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      console.error("Error parsing timestamp:", error);
      return "Unknown";
    }
  };

  const getTokenAge = (createdAt: string) => {
    try {
      const now = new Date();
      const created = new Date(createdAt);
      const diffInHours = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "< 1h old";
      if (diffInHours < 24) return `${diffInHours}h old`;
      return `${Math.floor(diffInHours / 24)}d old`;
    } catch (error) {
      console.error("Error parsing creation date:", error);
      return "Unknown age";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 animate-fade-in">
              Loading FRESH token launches from Telegram...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !groupData) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="text-red-400 animate-fade-in">
                ❌ Error: {error}
              </div>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-600/80 text-white rounded-lg px-6 py-2 transition-all duration-200"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Group not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-[#151A2C] border-gray-700 animate-fade-in">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-white hover:bg-[#1A2137] rounded-lg p-2 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-blue-500/20">
                    <AvatarImage
                      src={`/placeholder.svg?height=64&width=64&text=${groupData.group_name.slice(
                        0,
                        2
                      )}`}
                      alt={groupData.group_name}
                    />
                    <AvatarFallback className="bg-[#1A2137] text-white text-xl font-bold">
                      {groupData.group_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                      {groupData.group_name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className="bg-green-600 text-white rounded-lg px-3 py-1">
                        🚀 FRESH LAUNCHES
                      </Badge>
                      <Badge className="bg-blue-600 text-white rounded-lg px-3 py-1">
                        {groupData.total_calls} NEW TOKENS
                      </Badge>
                      <Badge className="bg-purple-600 text-white rounded-lg px-3 py-1">
                        {timeframe.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent rounded-lg px-4 py-2 transition-all duration-200"
                  onClick={() =>
                    window.open(
                      `https://t.me/${groupData.group_id}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Join Telegram
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={refreshData}
                  disabled={refreshing}
                  className="text-gray-400 hover:text-white hover:bg-[#1A2137] rounded-lg p-2 transition-all duration-200"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  onClick={handleTrack}
                  className={`${
                    isTracking
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105`}
                >
                  {isTracking ? (
                    <StarOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Star className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isTracking ? "Untrack Group" : "Track Group"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeframe Selector */}
        <Card className="bg-[#151A2C] border-gray-700 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 font-medium">Timeframe:</span>
              </div>
              <div className="flex gap-2">
                {["1d", "7d", "30d"].map((tf) => (
                  <Button
                    key={tf}
                    size="sm"
                    variant={timeframe === tf ? "default" : "outline"}
                    className={
                      timeframe === tf
                        ? "bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
                        : "border-gray-600 text-gray-300 hover:bg-[#1A2137] hover:text-white rounded-lg px-4 py-2 transition-all duration-200"
                    }
                    onClick={() => handleTimeframeChange(tf)}
                  >
                    {tf === "1d"
                      ? "24 Hours"
                      : tf === "7d"
                      ? "7 Days"
                      : "30 Days"}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Badge className="bg-yellow-600 text-white rounded-lg px-3 py-1">
                  Data from: {groupData.data_sources.join(", ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fresh Launches</p>
                  <p className="text-2xl font-bold text-white">
                    {groupData.total_calls}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg Market Cap</p>
                  <p className="text-2xl font-bold text-blue-400">
                    $
                    {formatNumber(
                      groupData.calls.reduce(
                        (sum, call) => sum + call.market_cap,
                        0
                      ) / groupData.calls.length || 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold text-purple-400">
                    $
                    {formatNumber(
                      groupData.calls.reduce(
                        (sum, call) => sum + call.volume_24h,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Newest Token</p>
                  <p className="text-sm font-bold text-white">
                    {groupData.calls.length > 0
                      ? getTokenAge(groupData.calls[0].created_at)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fresh Token Launches */}
        <Card className="bg-[#151A2C] border-gray-700 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xl text-white">
                FRESH TOKEN LAUNCHES - Just Dropped!
              </span>
              <Badge className="bg-green-600 text-white rounded-lg px-3 py-1 w-fit">
                BRAND NEW TOKENS
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {groupData.calls.map((call, index) => (
                <Card
                  key={`${call.contract}-${index}`}
                  className="bg-[#1A2137] border-gray-600/50 hover:border-blue-500/30 transition-all duration-200 group"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-4">
                        {call.image_uri && (
                          <img
                            src={
                              call.image_uri ||
                              "/placeholder.svg?height=48&width=48"
                            }
                            alt={call.symbol}
                            className="w-12 h-12 rounded-full ring-2 ring-blue-500/20"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3
                              className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors group-hover:text-blue-400 break-words"
                              onClick={() =>
                                router.push(`/chart/${call.contract}`)
                              }
                            >
                              ${call.symbol}
                            </h3>
                            {call.is_new && (
                              <Badge className="bg-green-600 text-white rounded-lg px-2 py-1 text-xs">
                                🆕 NEW
                              </Badge>
                            )}
                            {call.is_pump_token && (
                              <Badge className="bg-yellow-600 text-white rounded-lg px-2 py-1 text-xs">
                                PUMP.FUN
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg p-1 transition-all duration-200"
                              onClick={() =>
                                router.push(`/chart/${call.contract}`)
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-gray-400 mb-2 break-words">
                            {call.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono break-all">
                              {call.contract.slice(0, 8)}...
                              {call.contract.slice(-6)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-white rounded transition-all duration-200"
                              onClick={() => copyContract(call.contract)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Badge className="bg-gray-600 text-white rounded px-2 py-1 text-xs">
                              {getTokenAge(call.created_at)}
                            </Badge>
                            <Badge className="bg-blue-600/20 text-blue-400 rounded px-2 py-1 text-xs">
                              {call.source.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2 mb-1">
                          {call.price_change_24h > 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                          <span
                            className={`${
                              call.price_change_24h > 0
                                ? "text-green-400"
                                : "text-red-400"
                            } text-2xl font-bold`}
                          >
                            {call.price_change_24h > 0 ? "+" : ""}
                            {call.price_change_24h.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-gray-400 break-all">
                          ${formatPrice(call.price_usd)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Called by: {call.caller}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getTimeAgo(call.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Social Links */}
                    {(call.website || call.twitter || call.telegram) && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {call.website && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent rounded-lg px-3 py-2 transition-all duration-200"
                            onClick={() => window.open(call.website, "_blank")}
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            Website
                          </Button>
                        )}
                        {call.twitter && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent rounded-lg px-3 py-2 transition-all duration-200"
                            onClick={() => window.open(call.twitter, "_blank")}
                          >
                            <Twitter className="h-3 w-3 mr-1" />
                            Twitter
                          </Button>
                        )}
                        {call.telegram && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent rounded-lg px-3 py-2 transition-all duration-200"
                            onClick={() => window.open(call.telegram, "_blank")}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Telegram
                          </Button>
                        )}
                      </div>
                    )}

                    <Card className="bg-[#0F1419] border-gray-700/30 mb-4">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-300 whitespace-pre-line break-words">
                          {call.message}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Token Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <Card className="bg-[#0F1419] border-gray-700/30">
                        <CardContent className="p-3">
                          <p className="text-gray-400 text-sm">Market Cap</p>
                          <p className="text-white font-semibold">
                            ${formatNumber(call.market_cap)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#0F1419] border-gray-700/30">
                        <CardContent className="p-3">
                          <p className="text-gray-400 text-sm">24h Volume</p>
                          <p className="text-white font-semibold">
                            ${formatNumber(call.volume_24h)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#0F1419] border-gray-700/30">
                        <CardContent className="p-3">
                          <p className="text-gray-400 text-sm">Liquidity</p>
                          <p className="text-white font-semibold">
                            ${formatNumber(call.liquidity)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#0F1419] border-gray-700/30">
                        <CardContent className="p-3">
                          <p className="text-gray-400 text-sm">24h Txns</p>
                          <p className="text-white font-semibold">
                            <span className="text-green-400">
                              {call.buys_24h}B
                            </span>{" "}
                            /
                            <span className="text-red-400">
                              {call.sells_24h}S
                            </span>
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105"
                        onClick={() => window.open(call.chart_url, "_blank")}
                      >
                        📊 View Chart
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105"
                        onClick={() => window.open(call.trade_url, "_blank")}
                      >
                        💰 Trade Now
                      </Button>
                      {call.pump_url && (
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105"
                          onClick={() => window.open(call.pump_url, "_blank")}
                        >
                          🚀 Pump.fun
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {groupData.calls.length === 0 && (
                <Card className="bg-[#1A2137] border-gray-600/50">
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <div className="text-xl font-semibold text-white mb-2">
                      No fresh launches yet
                    </div>
                    <div className="text-gray-400">
                      Check back later for new token drops!
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
