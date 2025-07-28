// src/components/sections/Metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { title: "Fear & Greed", value: "46 Neutral" },
  { title: "24h Volume", value: "$823,372,957", delta: "-8.14%" },
  { title: "Market Cap", value: "$823,372,957", delta: "+8.14%" },
];

export default function Metrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((m) => (
        <Card key={m.title} className="bg-[#151A2C] text-white">
          <CardHeader>
            <CardTitle className="text-sm text-gray-200">{m.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-lg font-semibold">{m.value}</span>
            {m.delta && (
              <span
                className={`text-sm font-medium ${
                  m.delta.startsWith("+") ? "text-green-400" : "text-red-400"
                }`}
              >
                {m.delta}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
