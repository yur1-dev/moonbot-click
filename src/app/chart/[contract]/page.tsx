"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Copy,
  MessageCircle,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";
import {
  fetchRealTokenData,
  type RealTokenData,
} from "@/lib/real-data-service";

// TradingView Widget Component with proper theming
function TradingViewWidget({ symbol }: { symbol: string }) {
  useEffect(() => {
    try {
      const container = document.getElementById("tradingview_chart");
      if (container) {
        container.innerHTML = "";
      }
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `RAYDIUM:${symbol}SOL`,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        backgroundColor: "rgba(10, 14, 26, 1)",
        gridColor: "rgba(37, 43, 61, 0.5)",
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: "tradingview_chart",
      });
      if (container) {
        container.appendChild(script);
      }
      return () => {
        if (container) {
          container.innerHTML = "";
        }
      };
    } catch (error) {
      console.error("Failed to load TradingView widget:", error);
    }
  }, [symbol]);

  return (
    <div
      id="tradingview_chart"
      className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-[#151A2C] rounded-lg border border-gray-700"
      style={{ minHeight: "400px" }}
    />
  );
}

interface TokenCall {
  group_name: string;
  group_username?: string;
  caller_name: string;
  call_time: string;
  entry_price: number;
  current_performance: number;
  target?: string;
  message: string;
  status: "active" | "mooned" | "rugged";
}

export default function ChartPage() {
  const params = useParams<{ contract: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<string>("");
  const [tokenData, setTokenData] = useState<RealTokenData | null>(null);
  const [tokenCalls, setTokenCalls] = useState<TokenCall[]>([]);
  const [showCopied, setShowCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Generate realistic Telegram calls for this token
  const generateTokenCalls = (tokenData: RealTokenData): TokenCall[] => {
    const groups = [
      { name: "Major Livestream & Community Chat", username: "MajorTrending" },
      { name: "Alpha Calls Premium", username: "AlphaCalls" },
      { name: "Gem Finders VIP", username: "GemFinders" },
      { name: "Moon Hunters Elite", username: "MoonHunters" },
      { name: "Degen Central Hub", username: "DegenCentral" },
    ];

    const callers = [
      "CryptoWhale",
      "AlphaTrader",
      "GemHunter",
      "MoonSeeker",
      "DegenKing",
      "TokenMaster",
    ];

    const callMessages = [
      `NEW GEM ALERT: ${tokenData.symbol}\nContract: ${
        tokenData.contract
      }\nEntry: $${tokenData.price_usd.toFixed(
        8
      )}\nTarget: 10x minimum\nThis is going to MOON!`,
      `ALPHA CALL: ${tokenData.symbol}\n${tokenData.contract}\nCurrent MC: $${(
        tokenData.market_cap / 1000000
      ).toFixed(1)}M\nThis is the next 100x gem! Don't fade this!`,
      `HOT CALL: ${tokenData.name} (${tokenData.symbol})\nContract: ${
        tokenData.contract
      }\nLiquidity: $${(tokenData.liquidity / 1000).toFixed(
        0
      )}K\nVolume pumping! Get in NOW!`,
      `URGENT: ${tokenData.symbol} breaking out!\n${
        tokenData.contract
      }\nPrice: $${tokenData.price_usd.toFixed(8)}\nThis is going parabolic!`,
      `SNIPER CALL: ${tokenData.name}\nContract: ${
        tokenData.contract
      }\nEntry zone: $${tokenData.price_usd.toFixed(
        8
      )}\nTarget: 5-20x | Stop: -50%`,
    ];

    return Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => {
      const group = groups[Math.floor(Math.random() * groups.length)];
      const caller = callers[Math.floor(Math.random() * callers.length)];
      const hoursAgo = Math.floor(Math.random() * 24) + 1;
      const entryPrice = tokenData.price_usd * (0.7 + Math.random() * 0.6);
      const currentPerformance = tokenData.price_usd / entryPrice;

      let status: "active" | "mooned" | "rugged" = "active";
      if (currentPerformance > 2) status = "mooned";
      else if (currentPerformance < 0.5) status = "rugged";

      return {
        group_name: group.name,
        group_username: group.username,
        caller_name: caller,
        call_time: new Date(
          Date.now() - hoursAgo * 60 * 60 * 1000
        ).toISOString(),
        entry_price: entryPrice,
        current_performance: currentPerformance,
        target: `${Math.floor(Math.random() * 15) + 5}x`,
        message: callMessages[Math.floor(Math.random() * callMessages.length)],
        status: status,
      };
    });
  };

  const loadTokenData = async () => {
    try {
      const contractParam = params?.contract;
      if (!contractParam) {
        throw new Error("No contract address provided");
      }
      const contractAddress = decodeURIComponent(contractParam);
      setContract(contractAddress);
      console.log("Loading REAL token data for:", contractAddress);

      const realTokenData = await fetchRealTokenData(contractAddress);
      if (!realTokenData) {
        throw new Error("Token not found or no trading pairs available");
      }

      setTokenData(realTokenData);
      const calls = generateTokenCalls(realTokenData);
      setTokenCalls(calls);
      console.log("Token data loaded successfully!");
    } catch (err) {
      console.error("Error loading token data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load token data"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    setError(null);
    await loadTokenData();
    setRefreshing(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    loadTokenData();
  }, [params?.contract]);

  const copyContract = () => {
    try {
      navigator.clipboard.writeText(contract);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy contract:", error);
    }
  };

  const openDexScreener = () => {
    window.open(
      `https://dexscreener.com/solana/${contract}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openRaydium = () => {
    window.open(
      `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${contract}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openPumpFun = () => {
    window.open(
      `https://pump.fun/${contract}`,
      "_blank",
      "noopener,noreferrer"
    );
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

  const getTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const callTime = new Date(dateString);
      const diffInHours = Math.floor(
        (now.getTime() - callTime.getTime()) / (1000 * 60 * 60)
      );
      if (diffInHours < 1) return "Just now";
      if (diffInHours === 1) return "1 hour ago";
      return `${diffInHours} hours ago`;
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-300 animate-fade-in">
              Loading REAL token data from DexScreener...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract || !tokenData) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="text-red-400 animate-fade-in">
                {error || "Failed to load token data"}
              </div>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-600/80 text-white h-8 px-4 text-sm transition-all duration-200"
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

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-[#151A2C] border-gray-700 animate-fade-in">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4">
              {/* Top Row - Back button and refresh */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-white hover:bg-[#1A2137] h-8 px-2 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <Button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs transition-all duration-200"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-2 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
              {/* Token Info */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white break-words">
                    {tokenData.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-gray-300 text-lg sm:text-xl">
                      ${tokenData.symbol}
                    </span>
                    <Badge className="bg-green-600 text-white h-6 px-2 text-xs">
                      LIVE DATA
                    </Badge>
                  </div>
                </div>
                {/* Contract Address */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-gray-400 font-mono break-all">
                    {contract.slice(0, 8)}...{contract.slice(-6)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white transition-all duration-200"
                      onClick={copyContract}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {showCopied && (
                      <span className="text-xs text-green-400">Copied!</span>
                    )}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent h-7 px-3 text-xs transition-all duration-200"
                    onClick={openDexScreener}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    DexScreener
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent h-7 px-3 text-xs transition-all duration-200"
                    onClick={openRaydium}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Raydium
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white bg-transparent h-7 px-3 text-xs transition-all duration-200"
                    onClick={openPumpFun}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Pump.fun
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-fade-in">
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-400">Price (LIVE)</p>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white break-all">
                  ${formatPrice(tokenData.price_usd)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-400">24h Change</p>
                <div className="flex items-center space-x-1">
                  {tokenData.price_change_24h > 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
                  )}
                  <p
                    className={`text-sm sm:text-lg lg:text-xl font-bold ${
                      tokenData.price_change_24h > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {tokenData.price_change_24h > 0 ? "+" : ""}
                    {tokenData.price_change_24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-400">Market Cap</p>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">
                  ${formatNumber(tokenData.market_cap)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-400">24h Volume</p>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">
                  ${formatNumber(tokenData.volume_24h)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-400">Liquidity</p>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">
                  ${formatNumber(tokenData.liquidity)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#151A2C] border-gray-700 hover:bg-[#1A2137]/50 transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-400">24h Txns</p>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                  <span className="text-green-400 font-bold text-xs sm:text-sm">
                    {tokenData.transactions_24h.buys}B
                  </span>
                  <span className="text-red-400 font-bold text-xs sm:text-sm">
                    {tokenData.transactions_24h.sells}S
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Calls */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          {/* Chart */}
          <div className="xl:col-span-2">
            <Card className="bg-[#151A2C] border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-lg sm:text-xl text-white">
                    Live Chart - {tokenData.symbol}
                  </span>
                  <Badge className="bg-blue-600 text-white h-6 px-2 text-xs w-fit">
                    TradingView
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TradingViewWidget symbol={tokenData.symbol} />
              </CardContent>
            </Card>
          </div>

          {/* Telegram Calls */}
          <div className="xl:col-span-1">
            <Card className="bg-[#151A2C] border-gray-700 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-white">
                  <MessageCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span>Telegram Calls</span>
                  <Badge className="bg-green-600 text-white h-5 px-2 text-xs">
                    {tokenCalls.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {tokenCalls.map((call, index) => (
                  <Card key={index} className="bg-[#1A2137] border-gray-700/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-semibold text-white truncate">
                            {call.caller_name}
                          </span>
                          <Badge
                            className={`text-xs h-5 px-2 flex-shrink-0 ${
                              call.status === "mooned"
                                ? "bg-green-600 text-white"
                                : call.status === "rugged"
                                ? "bg-red-600 text-white"
                                : "bg-yellow-600 text-white"
                            }`}
                          >
                            {call.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {getTimeAgo(call.call_time)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-3 break-words">
                        {call.group_name} (@{call.group_username})
                      </div>
                      <Card className="bg-[#0F1419] border-gray-700/30 mb-3">
                        <CardContent className="p-3">
                          <div className="text-sm text-gray-300 whitespace-pre-line break-words">
                            {call.message}
                          </div>
                        </CardContent>
                      </Card>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="space-y-1">
                          <div>
                            <span className="text-gray-400">Entry: </span>
                            <span className="text-white break-all">
                              ${formatPrice(call.entry_price)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Target: </span>
                            <span className="text-yellow-400">
                              {call.target}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-gray-400">Performance: </span>
                            <span
                              className={`font-bold ${
                                call.current_performance > 1
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {call.current_performance.toFixed(2)}x
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Current: </span>
                            <span className="text-white break-all">
                              ${formatPrice(tokenData.price_usd)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-blue-400 hover:text-blue-400/80 hover:bg-blue-400/10 h-7 text-xs transition-all duration-200"
                        onClick={() =>
                          window.open(
                            `https://t.me/${call.group_username}`,
                            "_blank"
                          )
                        }
                      >
                        <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">Join {call.group_name}</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
