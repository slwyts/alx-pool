'use client';

import Link from 'next/link';
import { User, ShieldAlert, Inbox } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';

export default function MinePage() {
  const { walletConnected, myAssets, myRecords } = useAppStore();
  const { t } = useTranslation();

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
            <div className={`font-bold ${walletConnected ? 'text-green-400' : 'text-gray-500'}`}>
              {walletConnected ? t('connected') : t('not_connected')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{t('pending_release')}</div>
            <div className="text-xl font-tech font-bold">{myAssets.locked}</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{t('claimable')}</div>
            <div className="text-xl font-tech font-bold text-white">{myAssets.claimable}</div>
          </div>
        </div>
      </div>

      {/* 管理员入口 */}
      <Link
        href="/admin"
        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 text-sm font-bold hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>{t('admin_entry')}</span>
      </Link>

      {/* 质押记录 */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">
          {t('stake_records')}
        </h3>

        <div className="space-y-3">
          {myRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('no_records')}</p>
            </div>
          ) : (
            myRecords.map((record) => (
              <div
                key={record.id}
                className="glass-card p-4 rounded-xl border border-white/5 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-blue-500" />

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">#{record.id}</span>
                    {record.type === 'Admin' && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                        Admin Dist
                      </span>
                    )}
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded text-emerald-400">
                    {t('status_active')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-gray-500 scale-90 origin-left">{t('record_principal')}</div>
                    <div className="font-tech text-white text-base">{record.amount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 scale-90 origin-left">{t('record_return')}</div>
                    <div className="font-tech text-white text-base">{record.totalReturn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 scale-90 origin-right">{t('record_next')}</div>
                    <div className="font-tech text-white text-base">{record.nextReleaseDate}</div>
                  </div>
                </div>

                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: `${record.progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>
                    {t('progress')} {record.progress}%
                  </span>
                  <span>
                    {record.daysLeft} {t('days_left')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
