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

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      // MetaMask
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[];
        if (accounts.length > 0) {
          const rawBal = (await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })) as string;
          setWallet({
            address: accounts[0],
            balance: (parseInt(rawBal, 16) / 1e18).toFixed(4),
            network: "ethereum",
            walletType: "MetaMask",
          });
        }
      }
      // Phantom
      if (typeof window !== "undefined" && window.solana?.isPhantom) {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        setWallet({
          address: resp.publicKey.toString(),
          balance: "0.0000",
          network: "solana",
          walletType: "Phantom",
        });
      }
    } catch {
      console.log("No existing wallet connection found");
    }
  };

  const connectMetaMask = async (): Promise<WalletInfo> => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
    const rawBalance = (await window.ethereum.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    })) as string;
    return {
      address: accounts[0],
      balance: (parseInt(rawBalance, 16) / 1e18).toFixed(4),
      network: "ethereum",
      walletType: "MetaMask",
    };
  };

  const connectPhantom = async (): Promise<WalletInfo> => {
    if (!window.solana?.isPhantom) {
      window.open("https://phantom.app/", "_blank");
      throw new Error("Phantom wallet is not installed");
    }
    const resp = await window.solana.connect();
    return {
      address: resp.publicKey.toString(),
      balance: "0.0000",
      network: "solana",
      walletType: "Phantom",
    };
  };

  const connectSolflare = async (): Promise<WalletInfo> => {
    if (!window.solflare) {
      window.open("https://solflare.com/", "_blank");
      throw new Error("Solflare wallet is not installed");
    }
    await window.solflare.connect();
    return {
      address: window.solflare.publicKey.toString(),
      balance: "0.0000",
      network: "solana",
      walletType: "Solflare",
    };
  };

  const connectLedger = async (): Promise<WalletInfo> => {
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
      localStorage.setItem("connectedWallet", JSON.stringify(walletInfo));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
    localStorage.removeItem("connectedWallet");
    if (wallet?.walletType === "Phantom") {
      window.solana?.disconnect();
    }
  };

  return (
    <WalletContext.Provider
      value={{ wallet, isConnecting, connect, disconnect, error }}
    >
      {children}
    </WalletContext.Provider>
  );
};
