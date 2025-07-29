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
  RefreshCw,
  Zap,
  Users,
  Calendar,
  Crown,
  Shield,
  Target,
  DollarSign,
  LineChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GroupData } from "@/types/group";

// Simple fallback data that matches GroupData interface
const FALLBACK_GROUPS: GroupData[] = [
  {
    rank: 1,
    name: "Major Livestream & Community Chat",
    members: 97700,
    drops: 45, // Using 'drops' not 'launched'
    avgPump: "12.5x",
    best: "847x",
    worst: "0.2x",
    chat_id: "-1001234567891",
    username: "MajorTrending",
    creation_date: "2022-08-20T00:00:00Z",
    win_rate: 78.5,
    total_calls: 156,
    telegram_link: "https://t.me/MajorTrending",
    avatar:
      "https://ui-avatars.com/api/?name=Major+Livestream&size=40&background=1A2137&color=ffffff&bold=true",
  },
];

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
  performance?: number;
  status?: "active" | "rugged" | "mooned";
}

interface GroupOwner {
  username?: string;
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
  is_premium?: boolean;
}

interface ExtendedGroupData extends GroupData {
  description?: string;
  invite_link?: string;
  owner?: GroupOwner;
  admins_count?: number;
  member_limit?: number;
  is_verified?: boolean;
  is_scam?: boolean;
  is_fake?: boolean;
  recent_tokens: NewTokenCall[];
  performance_stats: {
    total_volume: number;
    avg_market_cap: number;
    success_rate: number;
    total_profit: number;
    best_performer: NewTokenCall | null;
    worst_performer: NewTokenCall | null;
  };
}

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [groupData, setGroupData] = useState<ExtendedGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("7d");
  const [memberCount, setMemberCount] = useState<number>(0);

  const fetchGroupData = async (selectedTimeframe: string = timeframe) => {
    try {
      const groupIdParam = params?.id;
      if (!groupIdParam) {
        throw new Error("No group ID provided");
      }

      const groupId = decodeURIComponent(groupIdParam);
      console.log(
        "Fetching group data for:",
        groupId,
        "timeframe:",
        selectedTimeframe
      );

      setLoading(true);
      setError(null);

      // Try to fetch real data first
      try {
        const [groupResponse, tokensResponse] = await Promise.all([
          fetch(`https://api.moonbot.click/api/chats`),
          fetch(
            `/api/tokens?groupId=${encodeURIComponent(
              groupId
            )}&timeframe=${selectedTimeframe}`
          ),
        ]);

        let groupInfo: any = null;
        let tokensData: any = { calls: [], total_calls: 0 };

        // Process group info
        if (groupResponse.ok) {
          const allGroups = await groupResponse.json();
          groupInfo = allGroups.find(
            (g: any) => g.title === groupId || g.username === groupId
          );
        }

        // Process tokens data
        if (tokensResponse.ok) {
          tokensData = await tokensResponse.json();
        }

        // Create comprehensive group data
        const comprehensiveGroupData: ExtendedGroupData = {
          rank: 1,
          name: groupInfo?.title || groupId,
          members: groupInfo?.real_member_count || groupInfo?.member_count || 0,
          drops: tokensData.total_calls || 0,
          avgPump: "0x",
          best: "0x",
          worst: "0x",
          chat_id: groupInfo?.chat_id,
          username: groupInfo?.username,
          creation_date: groupInfo?.creation_date,
          win_rate: 0,
          total_calls: tokensData.total_calls || 0,
          telegram_link: groupInfo?.username
            ? `https://t.me/${groupInfo.username.replace("@", "")}`
            : undefined,
          avatar:
            groupInfo?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              groupId
            )}&size=128&background=1A2137&color=ffffff&bold=true`,
          description:
            groupInfo?.description ||
            "Crypto trading group sharing fresh token launches",
          invite_link: groupInfo?.invite_link,
          owner: {
            username: groupInfo?.owner_username || "Unknown",
            first_name: groupInfo?.owner_first_name,
            is_verified: groupInfo?.owner_verified || false,
            is_premium: groupInfo?.owner_premium || false,
          },
          admins_count: groupInfo?.admins_count || 1,
          member_limit: groupInfo?.member_limit || 200000,
          is_verified: groupInfo?.is_verified || false,
          is_scam: groupInfo?.is_scam || false,
          is_fake: groupInfo?.is_fake || false,
          recent_tokens: tokensData.calls || [],
          performance_stats: calculatePerformanceStats(tokensData.calls || []),
        };

        // Calculate performance metrics
        if (comprehensiveGroupData.recent_tokens.length > 0) {
          const tokens = comprehensiveGroupData.recent_tokens;
          const profitable = tokens.filter(
            (t) => (t.performance || t.price_change_24h) > 0
          );
          comprehensiveGroupData.win_rate =
            (profitable.length / tokens.length) * 100;

          const avgPerformance =
            tokens.reduce(
              (sum, t) => sum + (t.performance || t.price_change_24h / 100 + 1),
              0
            ) / tokens.length;
          comprehensiveGroupData.avgPump = `${avgPerformance.toFixed(2)}x`;

          const bestToken = tokens.reduce((best, current) =>
            (current.performance || current.price_change_24h) >
            (best.performance || best.price_change_24h)
              ? current
              : best
          );
          const worstToken = tokens.reduce((worst, current) =>
            (current.performance || current.price_change_24h) <
            (worst.performance || worst.price_change_24h)
              ? current
              : worst
          );

          comprehensiveGroupData.best = `${(
            (bestToken.performance || bestToken.price_change_24h / 100 + 1) *
            100
          ).toFixed(1)}%`;
          comprehensiveGroupData.worst = `${(
            (worstToken.performance || worstToken.price_change_24h / 100 + 1) *
            100
          ).toFixed(1)}%`;
        }

        setGroupData(comprehensiveGroupData);
        setMemberCount(comprehensiveGroupData.members);
      } catch (apiError) {
        console.warn("API failed, using fallback data:", apiError);

        // Use fallback data
        const fallbackGroup = FALLBACK_GROUPS[0];
        const fallbackData: ExtendedGroupData = {
          ...fallbackGroup,
          name: groupId,
          description: "Crypto trading group sharing fresh token launches",
          recent_tokens: [],
          performance_stats: {
            total_volume: 0,
            avg_market_cap: 0,
            success_rate: 0,
            total_profit: 0,
            best_performer: null,
            worst_performer: null,
          },
        };

        setGroupData(fallbackData);
        setMemberCount(fallbackGroup.members);
        setError("Using cached data - API temporarily unavailable");
      }

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
      console.error("Failed to fetch group data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceStats = (tokens: NewTokenCall[]) => {
    if (tokens.length === 0) {
      return {
        total_volume: 0,
        avg_market_cap: 0,
        success_rate: 0,
        total_profit: 0,
        best_performer: null,
        worst_performer: null,
      };
    }

    const total_volume = tokens.reduce(
      (sum, token) => sum + token.volume_24h,
      0
    );
    const avg_market_cap =
      tokens.reduce((sum, token) => sum + token.market_cap, 0) / tokens.length;
    const profitable = tokens.filter(
      (token) => (token.performance || token.price_change_24h) > 0
    );
    const success_rate = (profitable.length / tokens.length) * 100;

    const best_performer = tokens.reduce((best, current) =>
      (current.performance || current.price_change_24h) >
      (best.performance || best.price_change_24h)
        ? current
        : best
    );

    const worst_performer = tokens.reduce((worst, current) =>
      (current.performance || current.price_change_24h) <
      (worst.performance || worst.price_change_24h)
        ? current
        : worst
    );

    const total_profit = tokens.reduce((sum, token) => {
      const performance = token.performance || token.price_change_24h / 100 + 1;
      return sum + (performance - 1) * token.market_cap * 0.01;
    }, 0);

    return {
      total_volume,
      avg_market_cap,
      success_rate,
      total_profit,
      best_performer,
      worst_performer,
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchGroupData(timeframe);
    setRefreshing(false);
  };

  const handleTimeframeChange = async (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    await fetchGroupData(newTimeframe);
  };

  useEffect(() => {
    fetchGroupData();
  }, [params?.id]);

  const handleTrack = () => {
    if (!groupData) return;

    try {
      setIsTracking(!isTracking);
      const trackedGroups = JSON.parse(
        localStorage.getItem("trackedGroups") || "[]"
      );

      if (!isTracking) {
        if (!trackedGroups.includes(groupData.name)) {
          trackedGroups.push(groupData.name);
          localStorage.setItem("trackedGroups", JSON.stringify(trackedGroups));
        }
      } else {
        const filtered = trackedGroups.filter(
          (name: string) => name !== groupData.name
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
      return "Unknown";
    }
  };

  const getGroupAge = (creationDate: string) => {
    try {
      const now = new Date();
      const created = new Date(creationDate);
      const diffInDays = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays < 30) return `${diffInDays} days old`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months old`;
      return `${Math.floor(diffInDays / 365)} years old`;
    } catch (error) {
      return "Unknown age";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading group data...</div>
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
              <div className="text-red-400">Error: {error}</div>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-600/80 text-white h-8 px-4 text-sm"
              >
                <RefreshCw
                  className={`h-3 w-3 mr-2 ${refreshing ? "animate-spin" : ""}`}
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
        <Card className="bg-[#151A2C] border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-white hover:bg-[#1A2137] h-8 px-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 ring-2 ring-blue-500/20">
                    <AvatarImage
                      src={groupData.avatar || "/placeholder.svg"}
                      alt={groupData.name}
                    />
                    <AvatarFallback className="bg-[#1A2137] text-white text-2xl font-bold">
                      {groupData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-white">
                          {groupData.name}
                        </h1>
                        {groupData.is_verified && (
                          <Badge className="bg-blue-600 text-white h-6 px-2 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            VERIFIED
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-3 max-w-2xl">
                        {groupData.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <Users className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-semibold">
                            {formatNumber(groupData.members)} members
                          </span>
                        </div>

                        <span className="text-gray-500">•</span>

                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {groupData.drops} drops
                          </span>
                        </div>

                        <span className="text-gray-500">•</span>

                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {getGroupAge(groupData.creation_date || "")}
                          </span>
                        </div>

                        {groupData.username && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-sm">
                              @{groupData.username}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Owner Info */}
                    {groupData.owner && (
                      <Card className="bg-[#1A2137] border-gray-600/50 p-3">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Owner:</span>
                          <span className="text-white font-medium">
                            {groupData.owner.first_name ||
                              groupData.owner.username ||
                              "Unknown"}
                          </span>
                          {groupData.owner.is_verified && (
                            <Badge className="bg-blue-600/20 text-blue-400 h-5 px-2 text-xs">
                              VERIFIED
                            </Badge>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {groupData.telegram_link && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent h-8 px-3 text-xs"
                    onClick={() =>
                      window.open(
                        groupData.telegram_link,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Join Group
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={refreshData}
                  disabled={refreshing}
                  className="text-gray-400 hover:text-white hover:bg-[#1A2137] h-8 px-2"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>

                <Button
                  onClick={handleTrack}
                  className={`${
                    isTracking
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white h-8 px-3 text-xs hover:scale-105`}
                >
                  {isTracking ? (
                    <StarOff className="h-3 w-3 mr-1" />
                  ) : (
                    <Star className="h-3 w-3 mr-1" />
                  )}
                  {isTracking ? "Untrack" : "Track"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Target className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Success Rate</p>
                  <p className="text-xl font-bold text-green-400">
                    {groupData.performance_stats.success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Volume</p>
                  <p className="text-xl font-bold text-blue-400">
                    ${formatNumber(groupData.performance_stats.total_volume)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Market Cap</p>
                  <p className="text-xl font-bold text-purple-400">
                    ${formatNumber(groupData.performance_stats.avg_market_cap)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <LineChart className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Performance</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {groupData.avgPump}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Drops */}
        <Card className="bg-[#151A2C] border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-white">
                  🔥 Recent Token Drops
                </CardTitle>
                <Badge className="bg-green-600 text-white h-6 px-2 text-xs animate-pulse">
                  LIVE UPDATES
                </Badge>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-medium text-sm">
                    Timeframe:
                  </span>
                  <div className="flex bg-[#1A2137] rounded-lg p-1 gap-1">
                    {["1d", "7d", "30d"].map((tf) => (
                      <Button
                        key={tf}
                        size="sm"
                        variant="ghost"
                        className={
                          timeframe === tf
                            ? "bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 text-xs rounded-md"
                            : "text-gray-300 hover:bg-[#0F1419] hover:text-white h-7 px-3 text-xs rounded-md"
                        }
                        onClick={() => handleTimeframeChange(tf)}
                      >
                        {tf === "1d" ? "24H" : tf === "7d" ? "7D" : "30D"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {groupData.recent_tokens.length === 0 ? (
              <Card className="bg-[#1A2137] border-gray-600/50">
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <div className="text-xl font-semibold text-white mb-2">
                    No token drops yet
                  </div>
                  <div className="text-gray-400">
                    Check back later for fresh launches!
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {groupData.recent_tokens.map((token, index) => (
                  <Card
                    key={`${token.contract}-${index}`}
                    className="bg-[#1A2137] border-gray-600/50 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {token.image_uri && (
                            <img
                              src={
                                token.image_uri ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={token.symbol}
                              className="w-12 h-12 rounded-full ring-2 ring-blue-500/20"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              ${token.symbol}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {token.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {token.contract.slice(0, 8)}...
                                {token.contract.slice(-6)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 text-gray-500 hover:text-white"
                                onClick={() => copyContract(token.contract)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {token.price_change_24h > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <span
                              className={`${
                                token.price_change_24h > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              } text-lg font-bold`}
                            >
                              {token.price_change_24h > 0 ? "+" : ""}
                              {token.price_change_24h.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            ${formatPrice(token.price_usd)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(token.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
