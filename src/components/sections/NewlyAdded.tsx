// src/components/sections/NewlyAdded.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const rows = [
  { name: "RockingGo", launched: 4, pump: "3.15x" },
  { name: "Tether", launched: 4, pump: "3.15x" },
  { name: "Forces88", launched: 4, pump: "3.15x" },
  { name: "RambledMonkey", launched: 4, pump: "3.15x" },
  { name: "Birdmanly", launched: 4, pump: "3.15x" },
];

export default function NewlyAdded() {
  return (
    <Card className="bg-[#151A2C] text-white">
      <CardHeader>
        <CardTitle className="text-lg">Newly Added</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Launched</TableHead>
              <TableHead>Avg. Pump</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.launched}</TableCell>
                <TableCell className="text-blue-400">{r.pump}</TableCell>
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
