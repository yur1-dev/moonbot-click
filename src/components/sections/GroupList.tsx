// src/components/sections/GroupTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const dummy = Array.from({ length: 5 }).map((_, idx) => ({
  rank: idx + 1,
  name: [
    "Tether USA",
    "RockingGo IND",
    "Birdmanly RUS",
    "Forces88 JAP",
    "RambledMonkey CAN",
  ][idx],
  members: 125,
  launched: 4,
  avgPump: "3.15x",
  best: "$XRP +8.14%",
  worst: "$ETH -0.14%",
}));

export default function GroupList() {
  return (
    <Card className="bg-[#151A2C] text-white">
      <CardHeader>
        <CardTitle className="text-xl">Group Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <Select>
              <SelectTrigger className="w-[120px] bg-[#1A2137] text-white border-gray-600">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2137] text-white">
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="pump">Avg. Pump</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[120px] bg-[#1A2137] text-white border-gray-600">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2137] text-white">
                <SelectItem value="usa">USA</SelectItem>
                <SelectItem value="jap">JAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select>
            <SelectTrigger className="w-[100px] bg-[#1A2137] text-white border-gray-600">
              <SelectValue placeholder="Show 10" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A2137] text-white">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Coins Launched</TableHead>
              <TableHead>Avg. Pump</TableHead>
              <TableHead>Best Coin</TableHead>
              <TableHead>Worst Coin</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummy.map((row) => (
              <TableRow key={row.rank}>
                <TableCell>{row.rank}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.members}</TableCell>
                <TableCell>{row.launched}</TableCell>
                <TableCell className="text-blue-400">{row.avgPump}</TableCell>
                <TableCell className="text-green-400">{row.best}</TableCell>
                <TableCell className="text-red-400">{row.worst}</TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-gray-700 rounded" />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-200"
                  >
                    Track
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
