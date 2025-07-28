// src/contexts/WalletContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface WalletInfo {
  address: string;
  balance: string;
  network: "ethereum" | "solana";
  walletType: string;
}

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on load
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      // Check MetaMask
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          });
          setWallet({
            address: accounts[0],
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
            network: "ethereum",
            walletType: "MetaMask",
          });
        }
      }

      // Check Phantom (Solana)
      if (
        typeof window !== "undefined" &&
        window.solana &&
        window.solana.isPhantom
      ) {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWallet({
            address: response.publicKey.toString(),
            balance: "0.0000", // You'd fetch this from Solana RPC
            network: "solana",
            walletType: "Phantom",
          });
        }
      }
    } catch (err) {
      console.log("No existing wallet connection found");
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    });

    return {
      address: accounts[0],
      balance: (parseInt(balance, 16) / 1e18).toFixed(4),
      network: "ethereum" as const,
      walletType: "MetaMask",
    };
  };

  const connectPhantom = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      window.open("https://phantom.app/", "_blank");
      throw new Error("Phantom wallet is not installed");
    }

    const response = await window.solana.connect();
    return {
      address: response.publicKey.toString(),
      balance: "0.0000", // You'd fetch real balance here
      network: "solana" as const,
      walletType: "Phantom",
    };
  };

  const connectSolflare = async () => {
    if (!window.solflare) {
      window.open("https://solflare.com/", "_blank");
      throw new Error("Solflare wallet is not installed");
    }

    await window.solflare.connect();
    return {
      address: window.solflare.publicKey.toString(),
      balance: "0.0000", // You'd fetch real balance here
      network: "solana" as const,
      walletType: "Solflare",
    };
  };

  const connectLedger = async () => {
    // For Ledger, you'd typically use a library like @ledgerhq/hw-transport-webusb
    // This is a simplified version
    throw new Error(
      "Ledger connection requires additional setup. Please use MetaMask or Phantom for now."
    );
  };

  const connect = async (walletType: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      let walletInfo: WalletInfo;

      switch (walletType) {
        case "MetaMask":
          walletInfo = await connectMetaMask();
          break;
        case "Phantom":
          walletInfo = await connectPhantom();
          break;
        case "Solflare":
          walletInfo = await connectSolflare();
          break;
        case "Ledger":
          walletInfo = await connectLedger();
          break;
        default:
          throw new Error("Unsupported wallet type");
      }

      setWallet(walletInfo);

      // Store connection info in localStorage
      localStorage.setItem("connectedWallet", JSON.stringify(walletInfo));
    } catch (err: any) {
      setError(err.message);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
    localStorage.removeItem("connectedWallet");

    // Disconnect from wallet if possible
    if (wallet?.walletType === "Phantom" && window.solana) {
      window.solana.disconnect();
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnecting,
        connect,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
