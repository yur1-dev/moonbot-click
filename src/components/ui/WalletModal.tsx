// src/components/WalletModal.tsx
"use client";

import { FC, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { toast } from "react-hot-toast";

const WALLETS = [
  {
    name: "MetaMask",
    icon: "/icons/metamask.png",
    description: "Connect using browser wallet",
    popular: true,
  },
  {
    name: "Phantom",
    icon: "/icons/phantom-wallet.png",
    description: "Solana wallet",
    popular: true,
  },
  {
    name: "Solflare",
    icon: "/icons/solflare.png",
    description: "Solana web wallet",
    popular: false,
  },
  {
    name: "Ledger",
    icon: "/icons/ledger.png",
    description: "Hardware wallet",
    popular: false,
  },
];

export const WalletModal: FC = () => {
  const { wallet, isConnecting, connect, disconnect, error } = useWallet();
  const [showMore, setShowMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const popularWallets = WALLETS.filter((w) => w.popular);
  const otherWallets = WALLETS.filter((w) => !w.popular);
  const visibleWallets = showMore ? WALLETS : popularWallets;

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setIsOpen(false);
      toast.success(`Connected to ${walletName}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    toast.success("Wallet disconnected");
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success("Address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = () => {
    if (!wallet) return;

    const baseUrl =
      wallet.network === "ethereum"
        ? "https://etherscan.io/address/"
        : "https://explorer.solana.com/address/";

    window.open(`${baseUrl}${wallet.address}`, "_blank");
  };

  // If wallet is connected, show wallet info
  if (wallet) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#1A65F6] hover:bg-[#1550C1] text-white flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            {formatAddress(wallet.address)}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm w-full bg-[#0A0E19] text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              Wallet Connected
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="bg-[#151A2C] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Wallet</span>
                <span className="text-sm font-medium">{wallet.walletType}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Network</span>
                <span className="text-sm font-medium capitalize">
                  {wallet.network}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Balance</span>
                <span className="text-sm font-medium">
                  {wallet.balance}{" "}
                  {wallet.network === "ethereum" ? "ETH" : "SOL"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Address</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">
                    {formatAddress(wallet.address)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 hover:bg-gray-700"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={openExplorer}
                className="flex-1 border-gray-700 hover:border-gray-500 bg-transparent hover:bg-gray-800"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Explorer
              </Button>

              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1 border-gray-700 hover:border-gray-500 bg-transparent hover:bg-gray-800 text-red-400 hover:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If no wallet connected, show connection options
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1A65F6] hover:bg-[#1550C1] text-white flex items-center cursor-pointer">
          <Wallet className="mr-2 h-4 w-4" />
          Connect
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm w-full bg-[#0A0E19] text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {visibleWallets.map((w) => (
            <Button
              key={w.name}
              variant="outline"
              onClick={() => handleConnect(w.name)}
              disabled={isConnecting}
              className="w-full justify-start border-gray-700 hover:border-gray-500 bg-transparent hover:bg-gray-800 text-gray-100 h-auto p-4"
            >
              <div className="flex items-center space-x-3 w-full">
                <Image src={w.icon} alt={w.name} width={32} height={32} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-gray-400">{w.description}</div>
                </div>
                {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </Button>
          ))}

          {otherWallets.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-center text-gray-400 hover:bg-gray-800"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show more wallets
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          By connecting a wallet, you agree to our Terms of Service and Privacy
          Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};
