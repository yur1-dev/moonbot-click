"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  BarChart3,
  TrendingUp,
  Zap,
  Copy,
  DollarSign,
} from "lucide-react";
import type { CoinCall } from "@/types/group";

interface TokenLinkMenuProps {
  coin: CoinCall;
  children: React.ReactNode;
  className?: string;
}

export default function TokenLinkMenu({
  coin,
  children,
  className = "",
}: TokenLinkMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLinkClick = (url: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Opening URL:", url);

    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open URL:", error);
    }

    setIsOpen(false);
  };

  const handleInternalChart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const chartUrl = coin.internal_chart_url || `/chart/${coin.contract}`;
    console.log("Opening internal chart:", chartUrl);

    try {
      window.location.href = chartUrl;
    } catch (error) {
      console.error("Failed to navigate to chart:", error);
    }

    setIsOpen(false);
  };

  const copyContract = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (coin.contract) {
      try {
        navigator.clipboard.writeText(coin.contract);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy contract:", error);
      }
    }
  };

  const toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={toggleMenu}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          // Only close if not hovering over menu
          setTimeout(() => {
            if (menuRef.current && !menuRef.current.matches(":hover")) {
              setIsOpen(false);
            }
          }, 100);
        }}
        className={`cursor-pointer ${className}`}
      >
        {children}
      </div>

      {isOpen && (
        <Card
          ref={menuRef}
          className="absolute z-[99999] top-full left-0 mt-2 w-80 bg-[#1A2137] border-gray-600 shadow-2xl"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-600">
                <DollarSign className="h-6 w-6 text-yellow-400" />
                <div>
                  <div className="text-white font-bold text-lg">
                    {coin.symbol}
                  </div>
                  <div className="text-gray-400 text-sm">{coin.name}</div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left hover:bg-blue-900/30 p-3 rounded-lg transition-colors"
                onClick={handleInternalChart}
              >
                <BarChart3 className="h-5 w-5 mr-3 text-blue-400" />
                <div>
                  <div className="text-white font-medium">
                    View Chart (Internal)
                  </div>
                  <div className="text-xs text-gray-400">
                    Advanced charting with TradingView
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left hover:bg-green-900/30 p-3 rounded-lg transition-colors"
                onClick={(e) => handleLinkClick(coin.chart_url, e)}
              >
                <TrendingUp className="h-5 w-5 mr-3 text-green-400" />
                <div>
                  <div className="text-white font-medium">DexScreener</div>
                  <div className="text-xs text-gray-400">
                    Live price & analytics
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left hover:bg-purple-900/30 p-3 rounded-lg transition-colors"
                onClick={(e) => handleLinkClick(coin.dex_url, e)}
              >
                <ExternalLink className="h-5 w-5 mr-3 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Raydium</div>
                  <div className="text-xs text-gray-400">Trade on DEX</div>
                </div>
              </Button>

              {coin.pump_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left hover:bg-yellow-900/30 p-3 rounded-lg transition-colors"
                  onClick={(e) => handleLinkClick(coin.pump_url!, e)}
                >
                  <Zap className="h-5 w-5 mr-3 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Pump.fun</div>
                    <div className="text-xs text-gray-400">
                      Meme coin platform
                    </div>
                  </div>
                </Button>
              )}

              <div className="pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {coin.contract
                      ? `${coin.contract.slice(0, 8)}...${coin.contract.slice(
                          -6
                        )}`
                      : "No contract"}
                  </div>
                  {coin.contract && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white transition-colors"
                      onClick={copyContract}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {showCopied && (
                  <div className="text-xs text-green-400 mt-1">
                    Copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
