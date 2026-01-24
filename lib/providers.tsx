"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { config, currentChain } from "./wagmi";
import { useState, useEffect, type ReactNode } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// 自动切换网络组件（不自动连接，让用户主动连接）
function AutoSwitchNetwork() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // 自动切换网络：如果已连接但网络不对，切换到正确网络
    if (isConnected && chainId && chainId !== currentChain.id) {
      // 添加网络并切换
      switchChain(
        { chainId: currentChain.id },
        {
          onError: async () => {
            // 如果切换失败，尝试添加网络
            if (typeof window !== "undefined" && window.ethereum) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: `0x${currentChain.id.toString(16)}`,
                      chainName: currentChain.name,
                      nativeCurrency: currentChain.nativeCurrency,
                      rpcUrls: [currentChain.rpcUrls.default.http[0]],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
              }
            }
          },
        }
      );
    }
  }, [isConnected, chainId, switchChain]);

  return null;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoSwitchNetwork />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
