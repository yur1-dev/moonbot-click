import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalMarketData } from "@/hooks/useGlobalMarketData";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import FearGreedIndexLive from "./FearGreedIndexLive";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0A0E19] border border-gray-600 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">
          {data.name === "marketCap" ? "Market Cap: " : "Volume: "}
          <span className="text-blue-400">{formatCurrency(data.value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Generate mock historical data for demonstration
const generateMockData = (
  currentValue: number,
  isPositive: boolean,
  points = 24
) => {
  const data = [];
  const baseValue = currentValue;
  const maxVariation = 0.05; // 5% max variation

  for (let i = points; i >= 0; i--) {
    const timeAgo = new Date();
    timeAgo.setHours(timeAgo.getHours() - i);

    // Create a trend based on whether the current change is positive
    const trendFactor = isPositive ? (points - i) / points : i / points;
    const randomVariation = (Math.random() - 0.5) * maxVariation;
    const trendVariation = (trendFactor - 0.5) * maxVariation;

    const value = baseValue * (1 + trendVariation + randomVariation * 0.3);

    data.push({
      time: timeAgo.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: Math.max(0, value),
    });
  }

  return data;
};

interface MetricCardWithChartProps {
  title: string;
  value: string;
  delta: string;
  isPositive: boolean;
  loading: boolean;
  currentValue: number;
  chartColor: string;
}

const MetricCardWithChart = ({
  title,
  value,
  delta,
  isPositive,
  loading,
  currentValue,
  chartColor,
}: MetricCardWithChartProps) => {
  const chartData = generateMockData(currentValue, isPositive);

  return (
    <Card className="bg-[#151A2C] text-white border-gray-700 hover:border-gray-600 transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-400 font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Value and Change */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">{value}</span>
              <div
                className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${
                  isPositive
                    ? "text-green-400 bg-green-400/10"
                    : "text-red-400 bg-red-400/10"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{delta}</span>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient
                      id={`gradient-${title}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={chartColor}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={chartColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: chartColor,
                      strokeWidth: 1,
                      strokeDasharray: "2 2",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={2}
                    dot={false}
                    fill={`url(#gradient-${title})`}
                    activeDot={{
                      r: 4,
                      fill: chartColor,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Time Range Indicator */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>24h ago</span>
              <span>Now</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Fear & Greed Index */}
        <FearGreedIndexLive data={fearGreed} loading={loading} error={error} />

        {/* Market Cap with Chart */}
        <MetricCardWithChart
          title="Total Market Cap"
          value={formatCurrency(marketCap)}
          delta={formatPercentage(marketCapChange)}
          isPositive={marketCapChange >= 0}
          loading={loading}
          currentValue={marketCap}
          chartColor={marketCapChange >= 0 ? "#10B981" : "#EF4444"}
        />

        {/* Volume with Chart */}
        <MetricCardWithChart
          title="24h Volume"
          value={formatCurrency(volume24h)}
          delta={formatPercentage(volumeChange)}
          isPositive={volumeChange >= 0}
          loading={loading}
          currentValue={volume24h}
          chartColor={volumeChange >= 0 ? "#3B82F6" : "#F59E0B"}
        />
      </div>
    </div>
  );
}
