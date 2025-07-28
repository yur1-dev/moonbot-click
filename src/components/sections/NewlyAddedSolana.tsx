"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSolanaNewTokens } from "@/hooks/useSolanaNewTokens";
import { formatMarketCap, formatPrice } from "@/utils/tokenFormatters";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

// Token logo component with fallback
function TokenLogo({
  token,
}: {
  token: { symbol: string; logoUrl: string; name: string };
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError) {
    // Fallback to gradient circle with first letter
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
        {token.symbol.charAt(0)}
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-700 rounded-full animate-pulse"></div>
      )}
      <img
        src={token.logoUrl || "/placeholder.svg"}
        alt={`${token.name} logo`}
        className={`w-10 h-10 rounded-full object-cover shadow-md transition-all duration-200 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}

// Skeleton loader for simplified layout
function TokenRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-700 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-700 rounded w-12"></div>
      </div>
    </div>
  );
}

export default function NewlyAddedSolana() {
  const { tokens, loading, error, lastUpdated } = useSolanaNewTokens();

  return (
    <div className="space-y-4">
      {/* Updated time outside the card */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <RefreshCw className="h-4 w-4" />
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      )}

      <Card className="bg-[#151A2C] text-white border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-br from-purple-700 to-blue-800 rounded-lg shadow-md">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <span>New Solana Tokens</span>
            </CardTitle>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-400/10 border-orange-400/20 px-3 py-2 rounded-lg mt-3 border">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Header row */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 text-sm text-gray-400 font-medium">
            <div className="flex-1">Token</div>
            <div className="w-20 text-right">Price</div>
            <div className="w-20 text-right">Market Cap</div>
            <div className="w-16 text-right">24h</div>
          </div>

          {/* Loading state */}
          {loading && tokens.length === 0 && (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <TokenRowSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Token rows */}
          {tokens.slice(0, 8).map((token, i) => (
            <div
              key={`${token.address}-${i}`}
              className="flex items-center justify-between px-6 py-3 border-b border-gray-700 hover:bg-[#1A2137] transition-all duration-200 group"
            >
              {/* Token info */}
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <TokenLogo token={token} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#151A2C] animate-pulse"></div>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {token.name}
                  </div>
                  <div className="text-gray-400 text-xs font-mono uppercase tracking-wide">
                    {token.symbol}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="w-20 text-right">
                <div className="text-white font-mono text-sm font-medium">
                  {formatPrice(token.price)}
                </div>
              </div>

              {/* Market Cap */}
              <div className="w-20 text-right">
                <div className="text-gray-300 text-sm">
                  {formatMarketCap(token.marketCap)}
                </div>
              </div>

              {/* 24h Change */}
              <div className="w-16 text-right">
                <Badge
                  variant="outline"
                  className={`text-xs px-1 py-0 ${
                    token.priceChange24h >= 0
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                      : "text-red-400 bg-red-400/10 border-red-400/20"
                  }`}
                >
                  {token.priceChange24h >= 0 ? (
                    <TrendingUp className="h-2 w-2 mr-1" />
                  ) : (
                    <TrendingDown className="h-2 w-2 mr-1" />
                  )}
                  {token.priceChange24h >= 0 ? "+" : ""}
                  {token.priceChange24h.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {tokens.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg font-medium">
                No tokens found
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Check back later for new listings
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
