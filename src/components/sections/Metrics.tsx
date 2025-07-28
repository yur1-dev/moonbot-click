import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalMarketData } from "@/hooks/useGlobalMarketData";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import FearGreedIndexLive from "./FearGreedIndexLive";

export default function MetricsLive() {
  const {
    fearGreed,
    marketCap,
    volume24h,
    marketCapChange,
    volumeChange,
    loading,
    error,
    lastUpdated,
  } = useGlobalMarketData();

  const metrics = [
    {
      title: "Total Market Cap",
      value: formatCurrency(marketCap),
      delta: formatPercentage(marketCapChange),
      isPositive: marketCapChange >= 0,
      loading: loading,
    },
    {
      title: "24h Volume",
      value: formatCurrency(volume24h),
      delta: formatPercentage(volumeChange),
      isPositive: volumeChange >= 0,
      loading: loading,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Last Updated Info */}
      {lastUpdated && !loading && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          {error && (
            <span className="text-red-400">⚠ Some data may be outdated</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Fear & Greed Index */}
        <FearGreedIndexLive data={fearGreed} loading={loading} error={error} />

        {/* Other Metrics */}
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="bg-[#151A2C] text-white border-gray-700"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {metric.loading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">
                    {metric.value}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${
                      metric.isPositive
                        ? "text-green-400 bg-green-400/10"
                        : "text-red-400 bg-red-400/10"
                    }`}
                  >
                    {metric.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{metric.delta}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
