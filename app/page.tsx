'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Layers, ArrowDownCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';
import { newsList } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
  usePoolConfig,
  useALXBalance,
  useALXAllowance,
  useApproveALX,
  useStake,
  useTotalStaked,
} from '@/lib/contracts/hooks';
import { parseUnits } from 'viem';

export default function StakePage() {
  const router = useRouter();
  const { showToast } = useAppStore();
  const { t, lang } = useTranslation();
  const [stakeInput, setStakeInput] = useState('');

  const { address, isConnected } = useAccount();

  // 合约数据
  const poolConfig = usePoolConfig();
  const { totalStakedFormatted } = useTotalStaked();
  const { balance, balanceFormatted, refetch: refetchBalance } = useALXBalance(address);
  const { allowance, refetch: refetchAllowance } = useALXAllowance(address);

  // 合约操作
  const { approveMax, isPending: isApproving, isSuccess: approveSuccess } = useApproveALX();
  const { stake, isPending: isStaking, isSuccess: stakeSuccess } = useStake();

  // 跟踪是否已处理授权成功
  const approveHandledRef = useRef(false);

  // 使用合约配置或默认值
  const config = {
    bonusRate: poolConfig.bonusRate ?? 0.5,
    lockDays: poolConfig.lockDays ?? 88,
    linearDays: poolConfig.linearDays ?? 270,
    initialRate: poolConfig.initialRate ?? 0.1,
  };

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

  // 检查是否需要授权
  const needsApproval = useCallback(() => {
    if (!stakeInput || !allowance) return true;
    try {
      const inputAmount = parseUnits(stakeInput, 18);
      return allowance < inputAmount;
    } catch {
      return true;
    }
  }, [stakeInput, allowance]);

  // 授权成功后自动发起质押
  useEffect(() => {
    if (approveSuccess && !approveHandledRef.current) {
      approveHandledRef.current = true;
      refetchAllowance();
      showToast(t('toast_approve_success') || 'Approved successfully');
      // 授权成功后自动质押
      if (stakeInput && parseFloat(stakeInput) > 0) {
        stake(stakeInput);
      }
    }
  }, [approveSuccess, refetchAllowance, showToast, t, stakeInput, stake]);

  // 重置授权处理标记（当开始新的授权时）
  useEffect(() => {
    if (isApproving) {
      approveHandledRef.current = false;
    }
  }, [isApproving]);

  // 质押成功后刷新
  useEffect(() => {
    if (stakeSuccess) {
      refetchBalance();
      refetchAllowance();
      setStakeInput('');
      showToast(t('toast_stake_success'));
      setTimeout(() => router.push('/mine'), 1000);
    }
  }, [stakeSuccess, refetchBalance, refetchAllowance, showToast, t, router]);

  // 质押处理
  const handleStake = () => {
    if (!isConnected) {
      showToast(t('toast_login_first'));
      return;
    }
    if (!stakeInput || parseFloat(stakeInput) <= 0) {
      showToast(t('toast_valid_amount'));
      return;
    }

    // 检查余额
    if (balance && parseUnits(stakeInput, 18) > balance) {
      showToast(t('toast_insufficient_balance') || 'Insufficient balance');
      return;
    }

    // 需要授权
    if (needsApproval()) {
      approveMax();
      return;
    }

    // 执行质押
    stake(stakeInput);
  };

  const buttonText = () => {
    if (isApproving) return t('btn_approving') || 'Approving...';
    if (isStaking) return t('btn_staking') || 'Staking...';
    if (needsApproval() && stakeInput) return t('btn_approve') || 'Approve ALX';
    return t('btn_stake');
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
          <div className="text-4xl font-bold font-tech text-white mb-4">
            {parseFloat(totalStakedFormatted).toLocaleString()} ALX
          </div>
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

        {/* 余额显示 */}
        {isConnected && (
          <div className="text-xs text-gray-500 mb-4 flex justify-between">
            <span>{t('balance') || 'Balance'}: {parseFloat(balanceFormatted).toLocaleString()} ALX</span>
            <button
              onClick={() => setStakeInput(balanceFormatted)}
              className="text-blue-400 hover:text-blue-300"
            >
              MAX
            </button>
          </div>
        )}

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
          disabled={isApproving || isStaking}
          className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-gray-200 transition active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText()}
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
