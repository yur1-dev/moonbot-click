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
    <Card className="bg-[#151A2C] text-white border-gray-700">
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
              <SelectContent className="bg-[#1A2137] text-white border-gray-600">
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="pump">Avg. Pump</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[120px] bg-[#1A2137] text-white border-gray-600">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2137] text-white border-gray-600">
                <SelectItem value="usa">USA</SelectItem>
                <SelectItem value="jap">JAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select>
            <SelectTrigger className="w-[100px] bg-[#1A2137] text-white border-gray-600">
              <SelectValue placeholder="Show 10" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A2137] text-white border-gray-600">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">#</TableHead>
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Members</TableHead>
              <TableHead className="text-gray-300">Coins Launched</TableHead>
              <TableHead className="text-gray-300">Avg. Pump</TableHead>
              <TableHead className="text-gray-300">Best Coin</TableHead>
              <TableHead className="text-gray-300">Worst Coin</TableHead>
              <TableHead className="text-gray-300">Trend</TableHead>
              <TableHead className="text-gray-300"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummy.map((row) => (
              <TableRow
                key={row.rank}
                className="border-gray-700 hover:bg-[#1A2137]"
              >
                <TableCell className="text-white">{row.rank}</TableCell>
                <TableCell className="text-white font-medium">
                  {row.name}
                </TableCell>
                <TableCell className="text-gray-300">{row.members}</TableCell>
                <TableCell className="text-gray-300">{row.launched}</TableCell>
                <TableCell className="text-blue-400 font-medium">
                  {row.avgPump}
                </TableCell>
                <TableCell className="text-green-400">{row.best}</TableCell>
                <TableCell className="text-red-400">{row.worst}</TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-gray-700 rounded" />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 cursor-pointer"
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
