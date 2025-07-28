// src/components/sections/FeaturedGroups.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const groups = [
  {
    name: "Tether",
    country: "USA",
    launched: 5,
    avatar: "/avatars/tether.png",
  },
  {
    name: "Forces88",
    country: "USA",
    launched: 5,
    avatar: "/avatars/forces88.png",
  },
  {
    name: "RockingGo",
    country: "USA",
    launched: 5,
    avatar: "/avatars/rockinggo.png",
  },
  {
    name: "RambledMonkey",
    country: "USA",
    launched: 5,
    avatar: "/avatars/rambled.png",
  },
];

export default function FeaturedGroups() {
  return (
    <Card className="bg-[#151A2C] text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Featured Groups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.name} className="bg-[#1A2137] text-white">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={g.avatar}
                    alt={g.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <CardTitle className="text-base font-medium">
                      {g.name}{" "}
                      <span className="text-xs text-gray-400">{g.country}</span>
                    </CardTitle>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-200"
                >
                  Track
                </Button>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                Tether is a telegram group for those who seek victory.
                <div className="mt-2 text-xs">Coins Launched: {g.launched}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
