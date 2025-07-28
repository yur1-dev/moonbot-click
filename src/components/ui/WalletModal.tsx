"use client";
import type React from "react";
import { type FC, useState, useEffect } from "react";
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
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import type { WalletType } from "@/types/wallet";

const WALLETS = [
  {
    name: "Phantom" as WalletType,
    icon: "/icons/phantom-wallet.png",
    description: "Solana wallet",
    popular: true,
  },
  {
    name: "Solflare" as WalletType,
    icon: "/icons/solflare.png",
    description: "Solana web wallet",
    popular: true,
  },
  {
    name: "Ledger" as WalletType,
    icon: "/icons/ledger.png",
    description: "Hardware wallet",
    popular: false,
  },
];

interface NotificationProps {
  message: string;
  type: "success" | "error" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

const Notification: FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
  const styles = {
    success: "bg-green-600 text-white border-green-500 shadow-green-500/20",
    error: "bg-red-600 text-white border-red-500 shadow-red-500/20",
    warning: "bg-yellow-600 text-white border-yellow-500 shadow-yellow-500/20",
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
  };

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
        styles[type]
      } transition-all duration-500 ease-in-out ${
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
      style={{
        minWidth: "320px",
        maxWidth: "90vw",
        transform: `translateX(-50%) ${
          isVisible ? "translateY(0)" : "translateY(-8px)"
        }`,
      }}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <span className="text-sm font-medium flex-1 text-center">{message}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors duration-200 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
      >
        ×
      </button>
    </div>
  );
};

// Simple custom badge component
const SimpleBadge: FC<{
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variantClasses = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-600 text-gray-100",
  };
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const WalletModal: FC = () => {
  const { wallet, isConnecting, connect, disconnect, error, refreshBalance } =
    useWallet();
  const [showMore, setShowMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
    isVisible: boolean;
  } | null>(null);

  const popularWallets = WALLETS.filter((w) => w.popular);
  const otherWallets = WALLETS.filter((w) => !w.popular);
  const visibleWallets = showMore ? WALLETS : popularWallets;

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    // Clear any existing notification first
    setNotification(null);

    // Small delay to ensure clean state
    setTimeout(() => {
      setNotification({ message, type, isVisible: true });
    }, 50);
  };

  const hideNotification = () => {
    if (notification) {
      setNotification((prev) => (prev ? { ...prev, isVisible: false } : null));
      // Remove from DOM after fade animation completes
      setTimeout(() => {
        setNotification(null);
      }, 500);
    }
  };

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification?.isVisible) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification?.isVisible]);

  const handleConnect = async (walletName: WalletType) => {
    try {
      console.log(`Connecting to ${walletName}...`);
      await connect(walletName);
      setIsOpen(false);
      showNotification(`Successfully connected to ${walletName}!`, "success");
    } catch (error) {
      console.error("Connection error in component:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      showNotification(errorMessage, "error");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    showNotification("Wallet disconnected successfully", "success");
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      showNotification("Balance updated successfully", "success");
    } catch (error) {
      console.error("Refresh balance error:", error);
      showNotification("Failed to refresh balance", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      showNotification("Address copied to clipboard", "success");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = () => {
    if (!wallet) return;
    const baseUrl = wallet.explorer || "https://explorer.solana.com/address/";
    window.open(`${baseUrl}${wallet.address}`, "_blank");
  };

  // Check if Phantom is available
  const isPhantomAvailable = () => {
    return typeof window !== "undefined" && (window as any).solana?.isPhantom;
  };

  // If wallet is connected, show wallet info
  if (wallet) {
    return (
      <>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={hideNotification}
          />
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#1A65F6] to-[#1550C1] hover:from-[#1550C1] hover:to-[#1A65F6] text-white flex items-center shadow-lg transition-all duration-200">
              <Wallet className="mr-2 h-4 w-4" />
              {wallet.username || formatAddress(wallet.address)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-full bg-gradient-to-br from-[#0A0E19] to-[#151A2C] text-gray-100 border border-gray-700 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-center text-xl font-bold">
                Wallet Connected
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Wallet Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#1A65F6] to-[#1550C1] rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <SimpleBadge
                  variant="secondary"
                  className="bg-green-600/20 text-green-400 border border-green-600/30"
                >
                  Connected
                </SimpleBadge>
              </div>
              {/* Wallet Info */}
              <div className="bg-[#151A2C]/50 backdrop-blur-sm rounded-xl p-4 space-y-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center">
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </span>
                  <span className="text-sm font-medium">
                    {wallet.walletType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    Network
                  </span>
                  <span className="text-sm font-medium">
                    {wallet.networkName || wallet.network}
                  </span>
                </div>
                {wallet.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Username
                    </span>
                    <span className="text-sm font-medium text-blue-400">
                      {wallet.username}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Balance</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {wallet.balance} {wallet.symbol || "SOL"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshBalance}
                      disabled={isRefreshing}
                      className="h-6 w-6 p-0 hover:bg-gray-700"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Address</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono bg-gray-800/50 px-2 py-1 rounded">
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
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={openExplorer}
                  className="flex-1 border-gray-600 hover:border-gray-500 bg-transparent hover:bg-gray-800/50 transition-all duration-200"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Explorer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  className="flex-1 border-red-600/50 hover:border-red-500 bg-transparent hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // If no wallet connected, show connection options
  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-[#1A65F6] to-[#1550C1] hover:from-[#1550C1] hover:to-[#1A65F6] text-white flex items-center shadow-lg transition-all duration-200 cursor-pointer">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md w-full bg-gradient-to-br from-[#0A0E19] to-[#151A2C] text-gray-100 border border-gray-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl font-bold">
              Connect Your Wallet
            </DialogTitle>
            <p className="text-gray-400 text-center text-sm">
              Choose your preferred Solana wallet to get started
            </p>
          </DialogHeader>
          {!isPhantomAvailable() && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 text-yellow-400 text-sm flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Phantom not detected</div>
                <div className="text-xs mt-1">
                  Please install Phantom from{" "}
                  <a
                    href="https://phantom.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    phantom.app
                  </a>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm flex items-start space-x-2">
              <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Connection Error</div>
                <div className="text-xs mt-1">{error}</div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {visibleWallets.map((w) => (
              <Button
                key={w.name}
                variant="outline"
                onClick={() => handleConnect(w.name)}
                disabled={
                  isConnecting ||
                  (w.name === "Phantom" && !isPhantomAvailable())
                }
                className="w-full justify-start border-gray-700 hover:border-gray-500 bg-transparent hover:bg-gray-800/50 text-gray-100 h-auto p-4 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="relative">
                    <Image
                      src={w.icon || "/placeholder.svg"}
                      alt={w.name}
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    {w.popular && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0E19]"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium group-hover:text-white transition-colors">
                      {w.name}
                    </div>
                    <div className="text-xs text-gray-400">{w.description}</div>
                  </div>
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    w.popular && (
                      <SimpleBadge
                        variant="secondary"
                        className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30"
                      >
                        Popular
                      </SimpleBadge>
                    )
                  )}
                </div>
              </Button>
            ))}
            {otherWallets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex justify-center text-gray-400 hover:bg-gray-800/50 transition-all duration-200"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show less options
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
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700/50">
            By connecting a wallet, you agree to our{" "}
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
              Privacy Policy
            </span>
            .
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
