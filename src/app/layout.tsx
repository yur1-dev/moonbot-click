// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { WalletProvider } from "@/context/WalletContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoonBot - Your Crypto Trading Assistant",
  description: "Advanced cryptocurrency trading bot and analytics platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-[#0A0E19] text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">{children}</div>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#151A2C",
                color: "#fff",
                border: "1px solid #374151",
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
