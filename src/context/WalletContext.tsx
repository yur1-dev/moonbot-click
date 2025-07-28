"use client";
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { WalletInfo, WalletType } from "@/types/wallet";

interface WalletContextType {
  wallet: WalletInfo | null;
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  error: null,
  refreshBalance: async () => {},
});

const getSolanaBalance = async (address: string): Promise<string> => {
  try {
    const response = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const data = await response.json();
    if (data.result && data.result.value !== undefined) {
      const balance = data.result.value / 1000000000;
      return balance.toFixed(4);
    }
    return "0.0000";
  } catch (error) {
    console.error("Failed to fetch Solana balance:", error);
    return "0.0000";
  }
};

const connectPhantom = async (): Promise<WalletInfo> => {
  console.log("🟣 Starting Phantom connection...");
  if (!window.solana) {
    window.open("https://phantom.app/", "_blank");
    throw new Error(
      "Phantom wallet not installed. Please install Phantom wallet."
    );
  }
  if (!window.solana.isPhantom) {
    throw new Error("Phantom wallet not detected");
  }
  try {
    const response = await window.solana.connect();
    if (!response || !response.publicKey) {
      throw new Error("Failed to connect to Phantom wallet");
    }
    const address = response.publicKey.toString();
    const balance = await getSolanaBalance(address);
    console.log("✅ Phantom connected successfully!");
    return {
      address,
      balance,
      network: "solana",
      walletType: "Phantom",
      networkName: "Solana Mainnet",
      symbol: "SOL",
      username: null,
      explorer: "https://explorer.solana.com",
    };
  } catch (error) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw new Error(
      `Phantom connection failed: ${err.message || "Unknown error"}`
    );
  }
};

const connectSolflare = async (): Promise<WalletInfo> => {
  console.log("🔶 Starting Solflare connection...");
  if (!window.solflare) {
    window.open("https://solflare.com/", "_blank");
    throw new Error(
      "Solflare wallet not installed. Please install Solflare wallet."
    );
  }
  if (!window.solflare.isSolflare) {
    throw new Error("Solflare wallet not detected");
  }
  try {
    const response = await window.solflare.connect();
    if (!response || !response.publicKey) {
      throw new Error("Failed to connect to Solflare wallet");
    }
    const address = response.publicKey.toString();
    const balance = await getSolanaBalance(address);
    console.log("✅ Solflare connected successfully!");
    return {
      address,
      balance,
      network: "solana",
      walletType: "Solflare",
      networkName: "Solana Mainnet",
      symbol: "SOL",
      username: null,
      explorer: "https://explorer.solana.com",
    };
  } catch (error) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw new Error(
      `Solflare connection failed: ${err.message || "Unknown error"}`
    );
  }
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = async () => {
    if (!wallet) return;
    try {
      const balance = await getSolanaBalance(wallet.address);
      setWallet((prev: WalletInfo | null) =>
        prev ? { ...prev, balance } : null
      );
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  };

  const connect = async (walletType: WalletType) => {
    if (walletType === "Ledger") {
      setError("Ledger integration coming soon");
      return;
    }
    console.log(`🎯 Attempting to connect to ${walletType}...`);
    setIsConnecting(true);
    setError(null);
    try {
      let connectedWallet: WalletInfo;
      switch (walletType) {
        case "Phantom":
          connectedWallet = await connectPhantom();
          break;
        case "Solflare":
          connectedWallet = await connectSolflare();
          break;
        default:
          throw new Error("Unsupported wallet type");
      }
      console.log(
        "✅ Wallet connected successfully:",
        connectedWallet.walletType
      );
      setWallet(connectedWallet);
      // Store in localStorage for persistence
      try {
        localStorage.setItem(
          "connectedWallet",
          JSON.stringify(connectedWallet)
        );
      } catch (storageError) {
        console.warn("Failed to save wallet to localStorage:", storageError);
      }
    } catch (error) {
      console.error("❌ Wallet connection error:", error);
      const err = error as { message?: string };
      const errorMessage = err.message || "Failed to connect wallet";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback(async () => {
    try {
      if (wallet?.walletType === "Phantom" && window.solana?.disconnect) {
        await window.solana.disconnect();
      }
      if (wallet?.walletType === "Solflare" && window.solflare?.disconnect) {
        await window.solflare.disconnect();
      }
      setWallet(null);
      setError(null);
      try {
        localStorage.removeItem("connectedWallet");
      } catch (storageError) {
        console.warn(
          "Failed to remove wallet from localStorage:",
          storageError
        );
      }
      console.log("✅ Wallet disconnected successfully");
    } catch (error) {
      console.error("Disconnect error:", error);
      const err = error as { message?: string };
      setError(`Failed to disconnect: ${err.message || "Unknown error"}`);
    }
  }, [wallet?.walletType]);

  const checkExistingConnection = async () => {
    try {
      const savedWallet = localStorage.getItem("connectedWallet");
      if (!savedWallet) return;
      const parsedWallet = JSON.parse(savedWallet) as WalletInfo;
      // Check if the wallet is still connected
      if (parsedWallet.walletType === "Phantom" && window.solana?.isConnected) {
        console.log("🔄 Reconnecting to existing Phantom session...");
        const connectedWallet = await connectPhantom();
        setWallet(connectedWallet);
      } else if (
        parsedWallet.walletType === "Solflare" &&
        window.solflare?.isConnected
      ) {
        console.log("🔄 Reconnecting to existing Solflare session...");
        const connectedWallet = await connectSolflare();
        setWallet(connectedWallet);
      } else {
        // Remove stale connection data
        localStorage.removeItem("connectedWallet");
      }
    } catch (error) {
      console.log("No existing wallet connection found:", error);
      try {
        localStorage.removeItem("connectedWallet");
      } catch (storageError) {
        console.warn("Failed to clear invalid wallet data:", storageError);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        checkExistingConnection();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for wallet events
  useEffect(() => {
    if (typeof window !== "undefined" && wallet) {
      const handleDisconnect = () => {
        console.log("Wallet disconnected externally");
        disconnect();
      };

      if (wallet.walletType === "Phantom" && window.solana) {
        window.solana.on("disconnect", handleDisconnect);
        return () => {
          if (window.solana?.off) {
            window.solana.off("disconnect", handleDisconnect);
          }
        };
      }
      if (wallet.walletType === "Solflare" && window.solflare) {
        window.solflare.on?.("disconnect", handleDisconnect);
        return () => {
          if (window.solflare?.off) {
            window.solflare.off("disconnect", handleDisconnect);
          }
        };
      }
    }
  }, [wallet, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connect,
        disconnect,
        isConnecting,
        error,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
