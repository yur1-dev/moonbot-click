import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
}

interface FearGreedIndexProps {
  data: FearGreedData | null;
  loading: boolean;
  error: string | null;
}

export default function FearGreedIndexLive({
  data,
  loading,
  error,
}: FearGreedIndexProps) {
  const getSentiment = (val: number) => {
    if (val <= 24)
      return {
        label: "Extreme Fear",
        color: "text-red-500",
        bgColor: "bg-red-500",
        textBg: "bg-red-500/20",
      };
    if (val <= 49)
      return {
        label: "Fear",
        color: "text-orange-500",
        bgColor: "bg-orange-500",
        textBg: "bg-orange-500/20",
      };
    if (val <= 74)
      return {
        label: "Greed",
        color: "text-green-400",
        bgColor: "bg-green-400",
        textBg: "bg-green-400/20",
      };
    return {
      label: "Extreme Greed",
      color: "text-green-500",
      bgColor: "bg-green-500",
      textBg: "bg-green-500/20",
    };
  };

  if (loading) {
    return (
      <Card className="bg-[#151A2C] text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 font-medium">
            Fear & Greed Index
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-[#151A2C] text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 font-medium">
            Fear & Greed Index
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-red-400 text-sm">Failed to load data</div>
        </CardContent>
      </Card>
    );
  }

  const sentiment = getSentiment(data.value);
  const percentage = (data.value / 100) * 100;

  return (
    <Card className="bg-[#151A2C] text-white border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-400 font-medium">
          Fear & Greed Index
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Value and Label */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white">{data.value}</span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${sentiment.color} ${sentiment.textBg}`}
            >
              {sentiment.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${sentiment.bgColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
