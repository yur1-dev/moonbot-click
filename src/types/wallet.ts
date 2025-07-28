export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: (options?: {
        onlyIfTrusted?: boolean;
      }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
      off?: (event: string, callback: (args: any) => void) => void;
    };
    solflare?: {
      isConnected: boolean;
      publicKey: { toString(): string };
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      on?: (event: string, callback: (args: any) => void) => void;
    };
  }
}
