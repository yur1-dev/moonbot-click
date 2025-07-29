"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  Users,
  ExternalLink,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import type { RealGroupData } from "@/lib/real-data-service";

export default function RealGroupList() {
  const router = useRouter();
  const [groups, setGroups] = useState<RealGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRealGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the list of groups from moonbot API
      const groupsResponse = await fetch("https://api.moonbot.click/api/chats");

      if (!groupsResponse.ok) {
        throw new Error(`Failed to fetch groups: ${groupsResponse.status}`);
      }

      const groupsList = await groupsResponse.json();

      if (!Array.isArray(groupsList)) {
        throw new Error("Invalid groups data format");
      }

      // Fetch real data for each group
      const realGroupsData = await Promise.all(
        groupsList.slice(0, 20).map(async (group: any) => {
          try {
            const response = await fetch(
              `/api/real-data?type=telegram&chatId=${group.chat_id}`
            );

            if (response.ok) {
              const realData = await response.json();
              return realData;
            }

            // Fallback with basic info if detailed data fails
            return {
              chat_id: group.chat_id,
              title: group.title,
              username: group.username,
              member_count: 0, // Will be updated with real count
              calls: [],
              stats: {
                total_calls: 0,
                win_rate: 0,
                avg_performance: 1,
                best_performance: 1,
                worst_performance: 1,
              },
            };
          } catch (error) {
            console.error(
              `Failed to fetch data for group ${group.chat_id}:`,
              error
            );
            return null;
          }
        })
      );

      const validGroups = realGroupsData.filter(Boolean) as RealGroupData[];
      setGroups(validGroups);
    } catch (err) {
      console.error("Failed to fetch real groups:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchRealGroups();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRealGroups();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Card className="bg-[#151A2C] text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl">Real Group Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">
              Fetching real data from Telegram groups and DEX APIs...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#151A2C] text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          Real Group Rankings - Live Data
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600">REAL DATA</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshData}
              disabled={refreshing}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardTitle>
        {error && (
          <div className="text-red-400 text-sm mt-2">
            {error} - Some data may be limited due to API restrictions
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">#</TableHead>
              <TableHead className="text-gray-300">Group</TableHead>
              <TableHead className="text-gray-300">Members</TableHead>
              <TableHead className="text-gray-300">Real Calls</TableHead>
              <TableHead className="text-gray-300">Win Rate</TableHead>
              <TableHead className="text-gray-300">Avg Performance</TableHead>
              <TableHead className="text-gray-300">Best Call</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group, index) => (
              <TableRow
                key={group.chat_id}
                className="border-gray-700 hover:bg-[#1A2137] cursor-pointer transition-colors"
                onClick={() =>
                  router.push(
                    `/real-group/${encodeURIComponent(group.chat_id)}`
                  )
                }
              >
                <TableCell className="text-white">{index + 1}</TableCell>
                <TableCell className="text-white font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={group.photo || "/placeholder.svg"}
                        alt={group.title}
                      />
                      <AvatarFallback className="bg-[#1A2137] text-white">
                        {group.title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{group.title}</span>
                        <Badge className="bg-blue-600 text-xs">LIVE</Badge>
                      </div>
                      {group.username && (
                        <div className="text-xs text-gray-400">
                          @{group.username}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{formatNumber(group.member_count)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  {group.stats.total_calls}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      group.stats.win_rate > 60
                        ? "bg-green-600"
                        : group.stats.win_rate > 40
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                  >
                    {group.stats.win_rate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-blue-400 font-medium">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{group.stats.avg_performance.toFixed(2)}x</span>
                  </div>
                </TableCell>
                <TableCell className="text-green-400">
                  {group.stats.best_performance.toFixed(2)}x
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {group.username && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://t.me/${group.username}`,
                            "_blank"
                          );
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/real-group/${encodeURIComponent(group.chat_id)}`
                        );
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {groups.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            No real group data available. Check API connections.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
