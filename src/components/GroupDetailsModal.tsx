"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
} from "lucide-react";
import type { GroupData, CoinCall, GroupStats } from "@/types/group";

interface GroupDetailsModalProps {
  group: GroupData | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock function to generate realistic group statistics
function generateGroupStats(groupName: string): GroupStats {
  const coinNames = [
    "PEPE",
    "SHIB",
    "DOGE",
    "FLOKI",
    "BONK",
    "WIF",
    "POPCAT",
    "MEW",
    "BRETT",
    "ANDY",
  ];
  const symbols = [
    "$PEPE",
    "$SHIB",
    "$DOGE",
    "$FLOKI",
    "$BONK",
    "$WIF",
    "$POPCAT",
    "$MEW",
    "$BRETT",
    "$ANDY",
  ];

  const recentCalls: CoinCall[] = Array.from({ length: 10 }, (_, i) => {
    const performance =
      Math.random() > 0.3
        ? Math.random() * 10 + 0.1
        : Math.random() * 0.8 + 0.1;
    const entryPrice = Math.random() * 0.001 + 0.0001;

    return {
      name: coinNames[Math.floor(Math.random() * coinNames.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      price_entry: entryPrice,
      price_current: entryPrice * performance,
      price_high: entryPrice * (performance + Math.random() * 2),
      market_cap: Math.floor(Math.random() * 100000000) + 1000000,
      holders: Math.floor(Math.random() * 50000) + 1000,
      buys_24h: Math.floor(Math.random() * 1000) + 100,
      sells_24h: Math.floor(Math.random() * 800) + 50,
      performance: performance,
      posted_date: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      chart_url: `https://dexscreener.com/solana/${Math.random()
        .toString(36)
        .substring(7)}`,
      dex_url: `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${Math.random()
        .toString(36)
        .substring(7)}`,
      status:
        performance > 2 ? "mooned" : performance < 0.5 ? "rugged" : "active",
    };
  });

  const winRate =
    (recentCalls.filter((call) => call.performance > 1).length /
      recentCalls.length) *
    100;
  const avgPerformance =
    recentCalls.reduce((sum, call) => sum + call.performance, 0) /
    recentCalls.length;

  const memberGrowth = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    count: Math.floor(Math.random() * 1000) + 5000 + i * 50,
  }));

  return {
    total_calls: recentCalls.length + Math.floor(Math.random() * 100),
    win_rate: winRate,
    avg_performance: avgPerformance,
    best_call: recentCalls.reduce((best, call) =>
      call.performance > best.performance ? call : best
    ),
    worst_call: recentCalls.reduce((worst, call) =>
      call.performance < worst.performance ? call : worst
    ),
    member_growth: memberGrowth,
    recent_calls: recentCalls.sort(
      (a, b) =>
        new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
    ),
  };
}

export default function GroupDetailsModal({
  group,
  isOpen,
  onClose,
}: GroupDetailsModalProps) {
  const [isTracking, setIsTracking] = useState(false);

  if (!group) return null;

  const stats = generateGroupStats(group.name);

  const handleTrack = () => {
    setIsTracking(!isTracking);
    const trackedGroups = JSON.parse(
      localStorage.getItem("trackedGroups") || "[]"
    );

    if (!isTracking) {
      if (!trackedGroups.includes(group.name)) {
        trackedGroups.push(group.name);
        localStorage.setItem("trackedGroups", JSON.stringify(trackedGroups));
      }
    } else {
      const filtered = trackedGroups.filter(
        (name: string) => name !== group.name
      );
      localStorage.setItem("trackedGroups", JSON.stringify(filtered));
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toExponential(2);
    return price.toFixed(6);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#151A2C] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>{group.name}</span>
            <Button
              onClick={handleTrack}
              className={`${
                isTracking
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {isTracking ? "✓ Tracking" : "Track Group"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1A2137] border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Members</p>
                  <p className="text-xl font-bold text-white">
                    {formatNumber(group.members)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A2137] border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-xl font-bold text-green-400">
                    {stats.win_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A2137] border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Avg Performance</p>
                  <p className="text-xl font-bold text-purple-400">
                    {stats.avg_performance.toFixed(2)}x
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A2137] border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Calls</p>
                  <p className="text-xl font-bold text-white">
                    {stats.total_calls}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calls" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A2137]">
            <TabsTrigger
              value="calls"
              className="data-[state=active]:bg-blue-600"
            >
              Recent Calls
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-blue-600"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="growth"
              className="data-[state=active]:bg-blue-600"
            >
              Member Growth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4">
            <div className="grid gap-4">
              {stats.recent_calls.slice(0, 8).map((call, index) => (
                <Card key={index} className="bg-[#1A2137] border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-bold text-white">
                            {call.symbol}
                          </h3>
                          <p className="text-sm text-gray-400">{call.name}</p>
                        </div>
                        <Badge
                          className={`${
                            call.status === "mooned"
                              ? "bg-green-600"
                              : call.status === "rugged"
                              ? "bg-red-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {call.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {call.performance > 1 ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                          <span
                            className={`font-bold ${
                              call.performance > 1
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {call.performance.toFixed(2)}x
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          ${formatPrice(call.price_entry)} → $
                          {formatPrice(call.price_current)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Market Cap</p>
                        <p className="text-white">
                          ${formatNumber(call.market_cap)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Holders</p>
                        <p className="text-white">
                          {formatNumber(call.holders)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">24h Buys</p>
                        <p className="text-green-400">{call.buys_24h}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">24h Sells</p>
                        <p className="text-red-400">{call.sells_24h}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        onClick={() => window.open(call.chart_url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Chart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        onClick={() => window.open(call.dex_url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Trade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1A2137] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-green-400">
                    Best Performing Call
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      {stats.best_call.symbol}
                    </h3>
                    <p className="text-3xl font-bold text-green-400">
                      {stats.best_call.performance.toFixed(2)}x
                    </p>
                    <p className="text-gray-400">
                      ${formatPrice(stats.best_call.price_entry)} → $
                      {formatPrice(stats.best_call.price_current)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Posted:{" "}
                      {new Date(
                        stats.best_call.posted_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A2137] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-red-400">
                    Worst Performing Call
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      {stats.worst_call.symbol}
                    </h3>
                    <p className="text-3xl font-bold text-red-400">
                      {stats.worst_call.performance.toFixed(2)}x
                    </p>
                    <p className="text-gray-400">
                      ${formatPrice(stats.worst_call.price_entry)} → $
                      {formatPrice(stats.worst_call.price_current)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Posted:{" "}
                      {new Date(
                        stats.worst_call.posted_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <Card className="bg-[#1A2137] border-gray-600">
              <CardHeader>
                <CardTitle>Member Growth (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-1">
                  {stats.member_growth.slice(-15).map((point, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 flex-1 rounded-t"
                      style={{
                        height: `${
                          (point.count /
                            Math.max(
                              ...stats.member_growth.map((p) => p.count)
                            )) *
                          100
                        }%`,
                        minHeight: "4px",
                      }}
                      title={`${point.date}: ${formatNumber(
                        point.count
                      )} members`}
                    />
                  ))}
                </div>
                <p className="text-center text-gray-400 mt-2">Last 15 days</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
