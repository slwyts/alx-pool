'use client';

import Link from 'next/link';
import { ShieldCheck, Zap, Settings, Loader2, AlertTriangle, Info, Download, Copy, Megaphone } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import {
  usePoolConfig,
  useAdminStakeForUser,
  useUpdateConfig,
  useEmergencyWithdraw,
  useALXBalance,
  useSetWithdrawFeeRate,
} from '@/lib/contracts/hooks';
import { contractAddresses } from '@/lib/contracts';

export default function AdminPage() {
  const { showToast } = useAppStore();
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const poolConfig = usePoolConfig();

  // 表单状态
  const [targetAddr, setTargetAddr] = useState('');
  const [amount, setAmount] = useState('');

  // 配置表单
  const [bonusRate, setBonusRate] = useState(0.5);
  const [lockDays, setLockDays] = useState(88);
  const [linearDays, setLinearDays] = useState(270);
  const [initialRate, setInitialRate] = useState(0.1);

  // 紧急提现表单
  const [withdrawToken, setWithdrawToken] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // 手续费表单
  const [feeRate, setFeeRate] = useState(0);

  // 合约操作
  const {
    adminStake,
    isPending: isAdminStaking,
    isSuccess: adminStakeSuccess,
  } = useAdminStakeForUser();

  const {
    updateConfig,
    isPending: isUpdatingConfig,
    isSuccess: updateConfigSuccess,
  } = useUpdateConfig();

  const {
    emergencyWithdraw,
    isPending: isWithdrawing,
    isSuccess: withdrawSuccess,
  } = useEmergencyWithdraw();

  const {
    setWithdrawFeeRate,
    isPending: isSettingFee,
    isSuccess: setFeeSuccess,
  } = useSetWithdrawFeeRate();

  // 合约池子余额
  const { balanceFormatted: poolBalance } = useALXBalance(contractAddresses.stakingPool);

  // 同步合约配置到表单
  useEffect(() => {
    if (poolConfig.bonusRate !== undefined) setBonusRate(poolConfig.bonusRate);
    if (poolConfig.lockDays !== undefined) setLockDays(poolConfig.lockDays);
    if (poolConfig.linearDays !== undefined) setLinearDays(poolConfig.linearDays);
    if (poolConfig.initialRate !== undefined) setInitialRate(poolConfig.initialRate);
    if (poolConfig.withdrawFeeRate !== undefined) setFeeRate(poolConfig.withdrawFeeRate);
  }, [poolConfig.bonusRate, poolConfig.lockDays, poolConfig.linearDays, poolConfig.initialRate, poolConfig.withdrawFeeRate]);

  // 操作成功回调
  useEffect(() => {
    if (adminStakeSuccess) {
      showToast(t('toast_admin_success'));
      setTargetAddr('');
      setAmount('');
    }
  }, [adminStakeSuccess, showToast, t]);

  useEffect(() => {
    if (updateConfigSuccess) {
      showToast(t('toast_config_saved'));
    }
  }, [updateConfigSuccess, showToast, t]);

  useEffect(() => {
    if (withdrawSuccess) {
      showToast(t('toast_withdraw_success'));
      setWithdrawAmount('');
    }
  }, [withdrawSuccess, showToast, t]);

  useEffect(() => {
    if (setFeeSuccess) {
      showToast(t('toast_fee_updated') || 'Fee rate updated');
    }
  }, [setFeeSuccess, showToast, t]);

  // 检查是否是 owner
  const isOwner =
    poolConfig.owner && address && poolConfig.owner.toLowerCase() === address.toLowerCase();

  // 管理员拨币
  const handleAdminDistribute = () => {
    if (!targetAddr || !targetAddr.startsWith('0x')) {
      showToast(t('toast_invalid_address') || 'Invalid address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t('toast_valid_amount'));
      return;
    }
    adminStake(targetAddr as `0x${string}`, amount);
  };

  // 保存配置
  const handleSaveConfig = () => {
    updateConfig(bonusRate, lockDays, linearDays, initialRate);
  };

  // 紧急提现
  const handleEmergencyWithdraw = () => {
    const tokenAddr = withdrawToken || contractAddresses.alxToken;
    if (!tokenAddr || !tokenAddr.startsWith('0x')) {
      showToast(t('toast_invalid_address'));
      return;
    }
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showToast(t('toast_valid_amount'));
      return;
    }
    emergencyWithdraw(tokenAddr as `0x${string}`, withdrawAmount);
  };

  // 设置手续费
  const handleSetFeeRate = () => {
    setWithdrawFeeRate(feeRate);
  };

  // 复制地址
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('toast_copied'));
  };

  // 非 owner 显示警告
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{t('connect_wallet_first') || 'Please connect wallet'}</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle className="w-12 h-12 mb-4 text-orange-500" />
        <p className="text-orange-400">{t('admin_only') || 'Admin access only'}</p>
        <Link href="/mine" className="mt-4 text-sm text-blue-400 hover:underline">
          {t('back_to_mine') || 'Back to My Page'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500">
          <ShieldCheck className="w-6 h-6" />
          <span>{t('admin_title')}</span>
        </h2>
        <Link
          href="/mine"
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold text-white hover:bg-white/20 transition"
        >
          {t('back_to_mine')}
        </Link>
      </div>

      {/* 公告管理入口 */}
      <Link
        href="/admin/announcements"
        className="glass-card rounded-2xl p-6 border border-white/5 hover:border-orange-500/30 transition block"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">{t('announcement_manage') || 'Announcement Management'}</h3>
              <p className="text-sm text-gray-400">{t('announcement_manage_desc') || 'Create, edit, delete announcements'}</p>
            </div>
          </div>
          <div className="text-gray-500">→</div>
        </div>
      </Link>

      {/* 合约信息 */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{t('contract_info')}</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
            <div>
              <div className="text-xs text-gray-500">{t('staking_pool_address')}</div>
              <div className="font-mono text-sm text-white break-all">{contractAddresses.stakingPool}</div>
            </div>
            <button onClick={() => copyToClipboard(contractAddresses.stakingPool)} className="p-2 hover:bg-white/10 rounded">
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
            <div>
              <div className="text-xs text-gray-500">{t('alx_token_address')}</div>
              <div className="font-mono text-sm text-white break-all">{contractAddresses.alxToken}</div>
            </div>
            <button onClick={() => copyToClipboard(contractAddresses.alxToken)} className="p-2 hover:bg-white/10 rounded">
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
            <div>
              <div className="text-xs text-gray-500">{t('pool_balance')}</div>
              <div className="font-tech text-lg text-emerald-400">{parseFloat(poolBalance).toLocaleString()} ALX</div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能1：手动拨币 */}
      <div className="glass-card admin-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>{t('admin_manual_stake')}</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('admin_target_user')}</label>
            <input
              type="text"
              value={targetAddr}
              onChange={(e) => setTargetAddr(e.target.value)}
              placeholder={t('admin_addr_placeholder')}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-mono focus:border-orange-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('admin_amount')}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('admin_amount_placeholder')}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-tech text-lg focus:border-orange-500/50"
            />
          </div>
          <button
            onClick={handleAdminDistribute}
            disabled={isAdminStaking}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/20 transition flex items-center justify-center gap-2"
          >
            {isAdminStaking && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('admin_btn_submit')}
          </button>
        </div>
      </div>

      {/* 功能2：参数配置 */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <span>{t('admin_params')}</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('param_bonus')} (0-1)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={bonusRate}
              onChange={(e) => setBonusRate(parseFloat(e.target.value) || 0)}
              className="w-24 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('param_lock')} (days)</span>
            <input
              type="number"
              value={lockDays}
              onChange={(e) => setLockDays(parseInt(e.target.value) || 0)}
              className="w-24 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('param_linear')}</span>
            <input
              type="number"
              value={linearDays}
              onChange={(e) => setLinearDays(parseInt(e.target.value) || 0)}
              className="w-24 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('param_initial_rate')} (0-1)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={initialRate}
              onChange={(e) => setInitialRate(parseFloat(e.target.value) || 0)}
              className="w-24 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={isUpdatingConfig}
            className="w-full border border-white/10 bg-white/5 text-gray-300 py-2 rounded text-sm hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
          >
            {isUpdatingConfig && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('btn_save_config')}
          </button>
        </div>
      </div>

      {/* 当前配置显示 */}
      <div className="glass-card rounded-2xl p-4 border border-white/5">
        <h4 className="text-xs text-gray-500 mb-2">{t('current_config')}</h4>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div>
            <div className="text-gray-600">Bonus</div>
            <div className="font-tech text-white">{(poolConfig.bonusRate ?? 0) * 100}%</div>
          </div>
          <div>
            <div className="text-gray-600">Lock</div>
            <div className="font-tech text-white">{poolConfig.lockDays ?? '--'}d</div>
          </div>
          <div>
            <div className="text-gray-600">Linear</div>
            <div className="font-tech text-white">{poolConfig.linearDays ?? '--'}d</div>
          </div>
          <div>
            <div className="text-gray-600">Initial</div>
            <div className="font-tech text-white">{(poolConfig.initialRate ?? 0) * 100}%</div>
          </div>
          <div>
            <div className="text-gray-600">Fee</div>
            <div className="font-tech text-white">{(poolConfig.withdrawFeeRate ?? 0) * 100}%</div>
          </div>
        </div>
      </div>

      {/* 提现手续费设置 */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-yellow-400" />
          <span>{t('withdraw_fee_setting')}</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('fee_rate')} (%)</span>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={feeRate * 100}
              onChange={(e) => setFeeRate((parseFloat(e.target.value) || 0) / 100)}
              className="w-24 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <button
            onClick={handleSetFeeRate}
            disabled={isSettingFee}
            className="w-full border border-white/10 bg-white/5 text-gray-300 py-2 rounded text-sm hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
          >
            {isSettingFee && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('btn_set_fee')}
          </button>
        </div>
      </div>

      {/* 紧急提现 */}
      <div className="glass-card rounded-2xl p-6 border border-red-500/20">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-red-400" />
          <span>{t('emergency_withdraw')}</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('token_address')}</label>
            <input
              type="text"
              value={withdrawToken}
              onChange={(e) => setWithdrawToken(e.target.value)}
              placeholder={contractAddresses.alxToken}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-mono focus:border-red-500/50"
            />
            <div className="text-xs text-gray-600 mt-1">{t('token_address_hint')}</div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('withdraw_amount')}</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-tech text-lg focus:border-red-500/50"
            />
          </div>
          <button
            onClick={handleEmergencyWithdraw}
            disabled={isWithdrawing}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isWithdrawing && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('btn_emergency_withdraw')}
          </button>
        </div>
      </div>
    </div>
  );
}
