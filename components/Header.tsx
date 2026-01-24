'use client';

import { Hexagon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect } from 'react';

export default function Header() {
  const { lang, toggleLang, showToast } = useAppStore();
  const { t } = useTranslation();

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // 同步钱包状态到 store
  const { setWalletState } = useAppStore();
  useEffect(() => {
    setWalletState(isConnected, address);
  }, [isConnected, address, setWalletState]);

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const handleToggleWallet = async () => {
    if (isConnected) {
      disconnect();
      showToast(t('toast_wallet_dis'));
    } else {
      // 使用注入式钱包 (MetaMask 等)
      const injectedConnector = connectors.find((c) => c.id === 'injected');
      if (injectedConnector) {
        try {
          connect({ connector: injectedConnector });
          showToast(t('toast_wallet_con'));
        } catch {
          showToast('Failed to connect wallet');
        }
      } else {
        showToast('No wallet found');
      }
    }
  };

  return (
    <header className="px-6 py-5 flex justify-between items-center glass-card sticky top-0 z-50 border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center bg-white/5">
          <Hexagon className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-widest font-tech">ALX POOL</span>
      </div>

      <div className="flex items-center gap-2">
        {/* 语言切换按钮 */}
        <button
          onClick={toggleLang}
          className="text-xs font-bold px-2 py-1 border border-white/20 rounded bg-white/5 hover:bg-white/10 transition"
        >
          <span className={lang === 'zh' ? 'text-white' : 'text-gray-500'}>中</span>
          <span className="text-gray-600">/</span>
          <span className={lang === 'en' ? 'text-white' : 'text-gray-500'}>EN</span>
        </button>

        {/* 钱包按钮 */}
        <div
          className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5 flex items-center gap-1 cursor-pointer"
          onClick={handleToggleWallet}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                : 'bg-gray-500'
            }`}
          />
          <span>{isConnected ? shortAddr : t('connect_wallet')}</span>
        </div>
      </div>
    </header>
  );
}
