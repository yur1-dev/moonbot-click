"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RealTimeMemberUpdaterProps {
  groups: any[];
  onUpdate: (updatedGroups: any[]) => void;
  updateInterval?: number; // in milliseconds
}

export default function RealTimeMemberUpdater({
  groups,
  onUpdate,
  updateInterval = 5 * 60 * 1000, // 5 minutes default
}: RealTimeMemberUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const updateMemberCounts = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const updatedGroups = await Promise.all(
        groups.map(async (group) => {
          try {
            const response = await fetch("/api/telegram-members", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: group.username,
                chatId: group.chat_id,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              return {
                ...group,
                members: data.memberCount,
              };
            }
          } catch (error) {
            console.error(
              `Failed to update member count for ${group.name}:`,
              error
            );
          }

          return group; // Return unchanged if update failed
        })
      );

      onUpdate(updatedGroups);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update member counts:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-update on interval
  useEffect(() => {
    const interval = setInterval(updateMemberCounts, updateInterval);
    return () => clearInterval(interval);
  }, [groups, updateInterval]);

  // Initial update
  useEffect(() => {
    if (groups.length > 0 && !lastUpdate) {
      updateMemberCounts();
    }
  }, [groups]);

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="border-gray-600 text-gray-300">
        {lastUpdate
          ? `Updated: ${lastUpdate.toLocaleTimeString()}`
          : "Updating..."}
      </Badge>
      <Button
        size="sm"
        variant="ghost"
        onClick={updateMemberCounts}
        disabled={isUpdating}
        className="text-gray-400 hover:text-white"
      >
        <RefreshCw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}
