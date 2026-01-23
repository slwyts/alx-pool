'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Layers, ArrowDownCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';
import { newsList } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function StakePage() {
  const router = useRouter();
  const { config, walletConnected, addRecord, showToast } = useAppStore();
  const { t, lang } = useTranslation();
  const [stakeInput, setStakeInput] = useState('');

  // 计算函数
  const calcTotal = useCallback(() => {
    if (!stakeInput) return '0';
    return (parseFloat(stakeInput) * (1 + config.bonusRate)).toFixed(2);
  }, [stakeInput, config.bonusRate]);

  const calcInitialRelease = useCallback(() => {
    const total = parseFloat(calcTotal());
    return (total * config.initialRate).toFixed(2);
  }, [calcTotal, config.initialRate]);

  const calcDailyRelease = useCallback(() => {
    const total = parseFloat(calcTotal());
    const remaining = total * (1 - config.initialRate);
    return (remaining / config.linearDays).toFixed(2);
  }, [calcTotal, config.initialRate, config.linearDays]);

  // 质押处理
  const handleStake = () => {
    if (!walletConnected) {
      showToast(t('toast_login_first'));
      return;
    }
    if (!stakeInput || parseFloat(stakeInput) <= 0) {
      showToast(t('toast_valid_amount'));
      return;
    }
    addRecord(parseFloat(stakeInput), 'User');
    setStakeInput('');
    showToast(t('toast_stake_success'));
    setTimeout(() => router.push('/mine'), 1000);
  };

  return (
    <div className="space-y-6">
      {/* 总质押信息卡片 */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Layers className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="text-gray-400 text-sm mb-1">{t('total_staked')}</div>
          <div className="text-4xl font-bold font-tech text-white mb-4">8,245,100.00</div>
          <div className="flex gap-4">
            <div>
              <div className="text-xs text-gray-500">{t('base_apy')}</div>
              <div className="text-lg font-tech text-emerald-400">{config.bonusRate * 100}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{t('lock_period')}</div>
              <div className="text-lg font-tech text-blue-400">
                {config.lockDays}d + {config.linearDays}d
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 质押输入卡片 */}
      <div className="glass-card rounded-2xl p-6 border-t-2 border-t-white/20">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5" />
          <span>{t('stake_title')}</span>
        </h2>

        <div className="relative mb-6">
          <input
            type="number"
            value={stakeInput}
            onChange={(e) => setStakeInput(e.target.value)}
            placeholder={t('input_placeholder')}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-16 text-xl font-tech text-white placeholder-gray-700 transition-all focus:border-white/30"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
            ALX
          </span>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3 border border-dashed border-white/10">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('expected_total')}</span>
            <span className="font-tech text-white">{calcTotal()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('initial_release')}</span>
            <span className="font-tech text-emerald-400">{calcInitialRelease()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('daily_release')}</span>
            <span className="font-tech text-blue-400">{calcDailyRelease()}</span>
          </div>
          <div className="text-xs text-gray-600 mt-2 leading-relaxed">{t('rule_desc')}</div>
        </div>

        <button
          onClick={handleStake}
          className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-gray-200 transition active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {t('btn_stake')}
        </button>
      </div>

      {/* 最新动态 */}
      <div className="flex items-center justify-between px-2">
        <span className="text-sm text-gray-400">{t('latest_news')}</span>
        <Link href="/news" className="text-xs text-white/50 cursor-pointer hover:text-white/80">
          {t('view_all')} &rarr;
        </Link>
      </div>
      <div className="glass-card p-4 rounded-xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <div className="text-sm text-gray-300 truncate">
          {lang === 'zh' ? newsList[0]?.title : newsList[0]?.title_en}
        </div>
      </div>
    </div>
  );
}
