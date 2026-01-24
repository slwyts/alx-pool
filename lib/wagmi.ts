import { http, createConfig, createStorage } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { type Chain } from "viem";

// Get chain config from environment
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || "Hardhat Local";

// Custom local chain (when using hardhat node)
const localChain: Chain = {
  id: chainId,
  name: chainName,
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  testnet: true,
};

// Determine which chain to use based on chainId
function getChain() {
  switch (chainId) {
    case 56:
      return bsc;
    case 97:
      return bscTestnet;
    default:
      return localChain;
  }
}

const activeChain = getChain();

// Create wagmi config with only injected wallet (MetaMask, etc.)
export const config = createConfig({
  chains: [activeChain],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    key: "alx-pool",
  }),
  transports: {
    [activeChain.id]: http(rpcUrl),
  },
  ssr: true,
});

// Export chain info for use in components
export const currentChain = activeChain;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
