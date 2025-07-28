// src/types/wallet.ts
// Ensure this file is treated as a module
export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      /**
       * Send a JSON-RPC request to the provider.
       */
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      /**
       * Listen for provider events.
       */
      on: (event: string, callback: (args: unknown) => void) => void;
      /**
       * Remove an event listener.
       */
      removeListener: (
        event: string,
        callback: (args: unknown) => void
      ) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: (options?: {
        onlyIfTrusted?: boolean;
      }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: unknown) => void) => void;
      off?: (event: string, callback: (args: unknown) => void) => void;
    };
    solflare?: {
      isConnected: boolean;
      publicKey: { toString(): string };
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      on?: (event: string, callback: (args: unknown) => void) => void;
    };
  }
}
