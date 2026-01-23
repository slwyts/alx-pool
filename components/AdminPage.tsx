'use client';

import { ShieldCheck, Zap, Settings } from 'lucide-react';
import { Config, AdminForm, TabType } from '@/lib/types';

interface AdminPageProps {
  config: Config;
  adminForm: AdminForm;
  onAdminFormChange: (form: AdminForm) => void;
  onConfigChange: (config: Config) => void;
  onAdminDistribute: () => void;
  onSaveConfig: () => void;
  onTabChange: (tab: TabType) => void;
  t: (key: string) => string;
}

export default function AdminPage({
  config,
  adminForm,
  onAdminFormChange,
  onConfigChange,
  onAdminDistribute,
  onSaveConfig,
  onTabChange,
  t,
}: AdminPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500">
          <ShieldCheck className="w-6 h-6" />
          <span>{t('admin_title')}</span>
        </h2>
        <button
          onClick={() => onTabChange('mine')}
          className="text-xs bg-white/10 px-3 py-1 rounded text-gray-400 hover:text-white"
        >
          Exit
        </button>
      </div>

      {/* 功能1：手动拨币 */}
      <div className="glass-card admin-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>{t('admin_manual_stake')}</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Target User</label>
            <input
              type="text"
              value={adminForm.targetAddr}
              onChange={(e) => onAdminFormChange({ ...adminForm, targetAddr: e.target.value })}
              placeholder={t('admin_addr_placeholder')}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-mono focus:border-orange-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Amount (ALX)</label>
            <input
              type="number"
              value={adminForm.amount}
              onChange={(e) => onAdminFormChange({ ...adminForm, amount: e.target.value })}
              placeholder={t('admin_amount_placeholder')}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-tech text-lg focus:border-orange-500/50"
            />
          </div>
          <button
            onClick={onAdminDistribute}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/20 transition"
          >
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
            <span className="text-xs text-gray-400">{t('param_bonus')}</span>
            <input
              type="number"
              step="0.1"
              value={config.bonusRate}
              onChange={(e) => onConfigChange({ ...config, bonusRate: parseFloat(e.target.value) })}
              className="w-20 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('param_lock')}</span>
            <input
              type="number"
              value={config.lockDays}
              onChange={(e) => onConfigChange({ ...config, lockDays: parseInt(e.target.value) })}
              className="w-20 bg-black/40 border border-white/10 rounded p-1 text-center font-tech text-white"
            />
          </div>
          <button
            onClick={onSaveConfig}
            className="w-full border border-white/10 bg-white/5 text-gray-300 py-2 rounded text-sm hover:bg-white/10 hover:text-white transition"
          >
            {t('btn_save_config')}
          </button>
        </div>
      </div>
    </div>
  );
}
