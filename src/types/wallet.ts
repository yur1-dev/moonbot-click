export interface SolanaProvider {
  isPhantom?: boolean;
  connect: (options?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: unknown) => void) => void;
  off?: (event: string, callback: (args: unknown) => void) => void;
  publicKey?: { toString(): string };
  isConnected?: boolean;
}

export interface SolflareProvider {
  isSolflare?: boolean;
  connect: (options?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, callback: (args: unknown) => void) => void;
  off?: (event: string, callback: (args: unknown) => void) => void;
  publicKey?: { toString(): string };
  isConnected?: boolean;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
    solflare?: SolflareProvider;
  }
}

export type WalletType = "Phantom" | "Solflare" | "Ledger";
export type NetworkType = "solana";

export interface WalletInfo {
  address: string;
  balance: string;
  network: NetworkType;
  walletType: WalletType;
  networkName?: string;
  symbol?: string;
  username?: string | null;
  explorer?: string;
}

export interface WalletError {
  code?: number;
  message: string;
  data?: unknown;
}
