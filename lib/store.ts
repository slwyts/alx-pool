'use client';

import { create } from 'zustand';
import { Config, StakeRecord, MyAssets, AdminForm } from './types';
import { Lang } from './i18n';

interface AppState {
  // 语言
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;

  // 钱包
  walletConnected: boolean;
  walletAddress: `0x${string}` | undefined;
  shortAddr: string;
  setWalletState: (connected: boolean, address: `0x${string}` | undefined) => void;

  // 配置
  config: Config;
  setConfig: (config: Config) => void;

  // 资产
  myAssets: MyAssets;
  setMyAssets: (assets: MyAssets) => void;

  // 质押记录
  myRecords: StakeRecord[];
  addRecord: (amount: number, type: 'User' | 'Admin') => void;

  // 管理员表单
  adminForm: AdminForm;
  setAdminForm: (form: AdminForm) => void;

  // Toast
  toast: { visible: boolean; message: string };
  showToast: (message: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 语言
  lang: 'zh',
  setLang: (lang) => set({ lang }),
  toggleLang: () => set((state) => ({ lang: state.lang === 'zh' ? 'en' : 'zh' })),

  // 钱包
  walletConnected: false,
  walletAddress: undefined,
  shortAddr: '',
  setWalletState: (connected, address) =>
    set({
      walletConnected: connected,
      walletAddress: address,
      shortAddr: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '',
    }),

  // 配置
  config: {
    bonusRate: 0.5,
    lockDays: 90,
    initialRate: 0.1,
    linearDays: 270,
  },
  setConfig: (config) => set({ config }),

  // 资产
  myAssets: {
    locked: '16,500.00',
    claimable: '125.50',
  },
  setMyAssets: (myAssets) => set({ myAssets }),

  // 质押记录
  myRecords: [
    {
      id: 1024,
      amount: 10000,
      totalReturn: 15000,
      nextReleaseDate: '2026-04-12',
      progress: 15,
      daysLeft: 305,
      type: 'User',
    },
  ],
  addRecord: (amount, type) => {
    const { config, myAssets } = get();
    const total = amount * (1 + config.bonusRate);
    const newRecord: StakeRecord = {
      id: Math.floor(Math.random() * 10000),
      amount,
      totalReturn: total,
      nextReleaseDate: 'Calculating...',
      progress: 0,
      daysLeft: config.lockDays + config.linearDays,
      type,
    };
    const currentLocked = parseFloat(myAssets.locked.replace(/,/g, ''));
    set((state) => ({
      myRecords: [newRecord, ...state.myRecords],
      myAssets: {
        ...state.myAssets,
        locked: (currentLocked + total).toLocaleString(),
      },
    }));
  },

  // 管理员表单
  adminForm: {
    targetAddr: '',
    amount: '',
  },
  setAdminForm: (adminForm) => set({ adminForm }),

  // Toast
  toast: { visible: false, message: '' },
  showToast: (message) => {
    set({ toast: { visible: true, message } });
    setTimeout(() => set({ toast: { visible: false, message: '' } }), 2000);
  },
}));
