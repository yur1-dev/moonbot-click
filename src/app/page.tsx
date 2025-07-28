// src/app/page.tsx
"use client";

import { Hero } from "@/components/sections/Hero";
import Metrics from "@/components/sections/Metrics";
import FeaturedGroups from "@/components/sections/FeaturedGroups";
import GroupTable from "@/components/sections/GroupList";
import NewlyAddedSolana from "@/components/sections/NewlyAddedSolana";

export default function HomePage() {
  return (
    <main className="relative min-h-screen px-18 py-6 bg-[#0A0E19] overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="stars4"></div>
      </div>

      {/* Planets Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-end items-start pr-10 pt-24">
        {/* Earth + Moon container */}
        <div className="relative">
          {/* Earth */}
          <div className="w-56 h-56 rounded-full bg-gradient-to-b from-blue-600 via-blue-500 to-green-600 shadow-[0_0_150px_rgba(0,150,255,0.7)] animate-spin-slower z-20 overflow-hidden">
            {/* Fake continents */}
            <div className="absolute top-8 left-10 w-20 h-16 bg-green-700/70 rounded-full rotate-12"></div>
            <div className="absolute bottom-12 right-8 w-16 h-12 bg-green-600/60 rounded-full -rotate-12"></div>
            {/* Atmosphere glow */}
            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl"></div>
          </div>

          {/* Moon - slightly above and left */}
          <div className="absolute -top-1/12 -left-32 w-28 h-28 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-[0_0_60px_rgba(200,200,255,0.5)] opacity-90 animate-spin-slow"></div>
        </div>
      </div>

      {/* Extra planets */}
      <div className="absolute top-1/7 left-1/4 w-16 h-16 bg-cyan-400 rounded-full shadow-[0_0_40px_rgba(0,255,255,0.3)] animate-orbit"></div>
      <div className="absolute bottom-1/3 right-60 w-24 h-24 bg-purple-500 rounded-full shadow-[0_0_60px_rgba(200,150,255,0.4)] ring-planet">
        <div className="absolute inset-0 w-[160%] h-[160%] border-2 border-purple-300/40 rounded-full -translate-x-[15%] -translate-y-[15%] rotate-45"></div>
      </div>

      {/* Content */}
      <div className="text-white relative grid grid-cols-1 gap-6 md:grid-cols-3 z-30">
        <section className="md:col-span-2">
          <Hero />
        </section>
        <section className="hidden md:block">{/* Future widget */}</section>

        <section className="md:col-span-2 space-y-6">
          <Metrics />
          <FeaturedGroups />
        </section>

        <section>
          <NewlyAddedSolana />
        </section>

        <section className="md:col-span-3">
          <GroupTable />
        </section>
      </div>
    </main>
  );
}
