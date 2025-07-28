// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Wallet, Menu, X, Search } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-[#0A0E19] border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-18 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="MoonBot logo"
            width={210}
            height={68}
            priority
          />
        </Link>

        {/* Desktop Nav + Search */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
                    (isActive
                      ? "bg-[#151A2C] text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar with Icon */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search Group"
              className="pl-10 bg-[#151A2C] text-gray-100 placeholder-gray-400 w-64 border-gray-600 focus:border-[#1A65F6] focus:ring-1 focus:ring-[#1A65F6]"
            />
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-300"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Connect Button (desktop) */}
        <div className="hidden md:block">
          <Button className="bg-[#1A65F6] hover:bg-[#1550C1] text-white transition-colors flex items-center cursor-pointer">
            <Wallet className="mr-2 h-4 w-4" />
            Connect
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0E19] border-t border-gray-700">
          <nav className="flex flex-col space-y-2 px-4 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors " +
                    (isActive
                      ? "bg-[#151A2C] text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile Search Bar with Icon */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search Group"
                className="pl-10 bg-[#151A2C] text-gray-100 placeholder-gray-400 w-full border-gray-600 focus:border-[#1A65F6] focus:ring-1 focus:ring-[#1A65F6]"
              />
            </div>
            <Button className="bg-[#1A65F6] hover:bg-[#1550C1] text-white transition-colors flex items-center justify-center mt-4 cursor-pointer">
              <Wallet className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
