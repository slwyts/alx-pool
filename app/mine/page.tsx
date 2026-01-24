'use client';

import Link from 'next/link';
import { User, ShieldAlert, Inbox, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';
import { useAccount } from 'wagmi';
import {
  useUserStakeIds,
  useStakeRecord,
  usePendingAmount,
  useClaim,
  usePoolConfig,
  useBlockTimestamp,
} from '@/lib/contracts/hooks';
import { useEffect, useState, useCallback } from 'react';
import { formatUnits } from 'viem';

// 单条质押记录组件
function StakeRecordCard({
  stakeId,
  blockTime,
  onStatusChange,
}: {
  stakeId: bigint;
  blockTime: number;
  onStatusChange?: (stakeId: bigint, isCompleted: boolean, pendingAmount: bigint) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useAppStore();
  const { record, isLoading } = useStakeRecord(stakeId);
  const { pending, pendingFormatted, refetch: refetchPending } = usePendingAmount(stakeId);
  const { claim, isPending: isClaiming, isSuccess: claimSuccess } = useClaim();

  useEffect(() => {
    if (claimSuccess) {
      refetchPending();
      showToast(t('toast_claim_success') || 'Claimed successfully');
    }
  }, [claimSuccess, refetchPending, showToast, t]);

  // 判断是否已完成 - 向父组件报告状态和可领取金额
  const isCompleted = record ? record.claimedAmount >= record.totalReward : false;
  const pendingAmount = pending ?? 0n;
  useEffect(() => {
    if (record) {
      onStatusChange?.(stakeId, isCompleted, pendingAmount);
    }
  }, [stakeId, isCompleted, pendingAmount, onStatusChange, record]);

  if (isLoading || !record) {
    return (
      <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      </div>
    );
  }

  // 计算进度 - 使用区块链时间
  const now = blockTime;
  const endTime = record.startTime + record.lockDuration + record.linearDuration;
  const totalDuration = record.lockDuration + record.linearDuration;
  const elapsed = Math.max(0, now - record.startTime);
  const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  const daysLeft = Math.max(0, Math.ceil((endTime - now) / 86400));

  // 判断状态
  const isLocked = now < record.startTime + record.lockDuration;
  const lockEndDate = new Date((record.startTime + record.lockDuration) * 1000);

  const handleClaim = () => {
    if (!pending || pending === 0n) {
      showToast(t('toast_nothing_to_claim') || 'Nothing to claim');
      return;
    }
    claim(stakeId);
  };

  // 状态显示
  const getStatusStyle = () => {
    if (isCompleted) return 'bg-blue-500/20 text-blue-400';
    if (isLocked) return 'bg-orange-500/20 text-orange-400';
    return 'bg-emerald-500/20 text-emerald-400';
  };

  const getStatusText = () => {
    if (isCompleted) return t('status_completed') || 'Completed';
    if (isLocked) return t('status_locked') || 'Locked';
    return t('status_active') || 'Active';
  };

  return (
    <div className="glass-card p-4 rounded-xl border border-white/5 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-blue-500' : 'bg-gradient-to-b from-emerald-500 to-blue-500'}`} />

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">#{record.id}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusStyle()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div>
          <div className="text-gray-500 scale-90 origin-left">{t('record_principal')}</div>
          <div className="font-tech text-white text-base">
            {parseFloat(record.principalFormatted).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-gray-500 scale-90 origin-left">{t('record_return')}</div>
          <div className="font-tech text-white text-base">
            {parseFloat(record.totalRewardFormatted).toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 scale-90 origin-right">{isCompleted ? t('claimed_total') || 'Claimed' : t('record_next')}</div>
          <div className="font-tech text-white text-base">
            {isCompleted
              ? parseFloat(record.claimedAmountFormatted).toLocaleString()
              : isLocked
                ? lockEndDate.toLocaleDateString()
                : t('now') || 'Now'}
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full transition-all ${isCompleted ? 'bg-blue-500' : 'bg-white'}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>
          {t('progress')} {progress}%
        </span>
        <span>
          {isCompleted ? t('all_claimed') || 'All claimed' : `${daysLeft} ${t('days_left')}`}
        </span>
      </div>

      {/* 可领取金额和领取按钮 */}
      {!isCompleted && (
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">{t('claimable') || 'Claimable'}</div>
            <div className="font-tech text-emerald-400">
              {parseFloat(pendingFormatted).toLocaleString()} ALX
            </div>
          </div>
          <button
            onClick={handleClaim}
            disabled={isClaiming || !pending || pending === 0n}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-bold rounded-lg transition"
          >
            {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : t('btn_claim') || 'Claim'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MinePage() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const poolConfig = usePoolConfig();
  const blockTime = useBlockTimestamp();

  const { stakeIds, isLoading } = useUserStakeIds(address);

  // 跟踪已完成的记录和可领取金额
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [pendingAmounts, setPendingAmounts] = useState<Map<string, bigint>>(new Map());

  const handleStatusChange = useCallback((stakeId: bigint, isCompleted: boolean, pendingAmount: bigint) => {
    const key = stakeId.toString();

    setCompletedIds((prev) => {
      const hasKey = prev.has(key);
      if (isCompleted === hasKey) return prev;
      const next = new Set(prev);
      if (isCompleted) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });

    setPendingAmounts((prev) => {
      const currentAmount = prev.get(key) ?? 0n;
      if (currentAmount === pendingAmount) return prev;
      const next = new Map(prev);
      next.set(key, pendingAmount);
      return next;
    });
  }, []);

  // 活跃记录数 = 总数 - 已完成数
  const activeCount = (stakeIds?.length || 0) - completedIds.size;

  // 总可领取金额
  const totalClaimable = Array.from(pendingAmounts.values()).reduce((sum, v) => sum + v, 0n);
  const totalClaimableFormatted = formatUnits(totalClaimable, 18);

  return (
    <div className="space-y-6">
      {/* 账户信息卡片 */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-white/10 to-transparent">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center">
            <User className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-400">{t('account_status')}</div>
            <div className={`font-bold ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
              {isConnected ? t('connected') : t('not_connected')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{t('pending_release')}</div>
            <div className="text-xl font-tech font-bold">
              {activeCount} {t('records') || 'Records'}
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{t('claimable')}</div>
            <div className="text-xl font-tech font-bold text-emerald-400">
              {parseFloat(totalClaimableFormatted).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 管理员入口 - 仅 owner 可见 */}
      {poolConfig.owner && address && poolConfig.owner.toLowerCase() === address.toLowerCase() && (
        <Link
          href="/admin"
          className="w-full py-3 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-bold hover:bg-orange-500/20 transition flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{t('admin_entry')}</span>
        </Link>
      )}

      {/* 质押记录 */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">
          {t('stake_records')}
        </h3>

        <div className="space-y-3">
          {!isConnected ? (
            <div className="text-center py-10 text-gray-600">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('connect_wallet_first') || 'Please connect wallet'}</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-500" />
            </div>
          ) : !stakeIds || stakeIds.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('no_records')}</p>
            </div>
          ) : (
            stakeIds.map((id) => (
              <StakeRecordCard
                key={id.toString()}
                stakeId={id}
                blockTime={blockTime}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
