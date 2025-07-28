// src/components/sections/Hero.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Hero = () => {
  return (
    <section className="text-start py-12">
      <h1 className="text-4xl font-bold mb-2">
        MoonBot Tracking Tool <br />
        Trade <span className="text-[#1A65F6]">Smarter</span>, Move{" "}
        <span className="text-[#1A65F6]">Faster</span>
      </h1>
      <p className="text-gray-400 text-lg mb-6">
        AI-powered insights for safer, smarter crypto trading.
      </p>

      {/* Search bar */}
      <div className="flex max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Telegram Group or Token"
            className="pl-10 pr-4 py-3 w-full bg-[#151A2C] text-gray-100 placeholder-gray-400 border-gray-600 focus:border-[#1A65F6] focus:ring-1 focus:ring-[#1A65F6]"
          />
        </div>
      </div>
    </section>
  );
};
