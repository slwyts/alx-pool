'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { STAKING_CONFIG, ALX_TOKEN } from '@/lib/constants'

export function StakePage() {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)

  const { data: balance } = useBalance({
    address,
    token: ALX_TOKEN.address === '0x0000000000000000000000000000000000000000' ? undefined : ALX_TOKEN.address,
  })

  const mockUserData = {
    stakedAmount: '0',
    totalReward: '0',
    claimable: '0',
    lockedAmount: '0',
  }

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    setIsStaking(true)
    setTimeout(() => {
      setIsStaking(false)
      setStakeAmount('')
    }, 2000)
  }

  const handleMax = () => {
    if (balance) {
      setStakeAmount(balance.formatted)
    }
  }

  const expectedReward = stakeAmount
    ? (parseFloat(stakeAmount) * STAKING_CONFIG.rewardRate).toFixed(2)
    : '0'

  const totalReceive = stakeAmount
    ? (parseFloat(stakeAmount) * (1 + STAKING_CONFIG.rewardRate)).toFixed(2)
    : '0'

  return (
    <div className="space-y-6">
      {/* Hero 区域 */}
      <div className="hero-gradient -mx-5 px-5 pt-4 pb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 tag mb-4">
            <span className="w-2 h-2 rounded-full bg-[#F3BA2F] animate-pulse-gold" />
            <span>质押进行中</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            ALX Staking
          </h1>
          <p className="text-lg text-white/50">
            质押即享 <span className="text-gradient-gold font-bold">{STAKING_CONFIG.rewardRate * 100}%</span> 收益
          </p>
        </div>

        {/* 核心数据 - 大卡片 */}
        <div className="stat-card-gold glow-gold">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">可领取收益</span>
            <span className="tag text-xs">ALX</span>
          </div>
          <div className="text-4xl font-bold text-gradient-gold mb-4">
            {mockUserData.claimable}
          </div>
          {parseFloat(mockUserData.claimable) > 0 ? (
            <button className="btn-primary w-full">
              立即领取
            </button>
          ) : (
            <div className="text-center text-white/30 text-sm py-2">
              暂无可领取收益
            </div>
          )}
        </div>
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <p className="text-xs text-white/40 mb-2">已质押</p>
          <p className="text-xl font-bold text-white">{mockUserData.stakedAmount}</p>
          <p className="text-xs text-white/30 mt-1">ALX</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-white/40 mb-2">累计收益</p>
          <p className="text-xl font-bold text-[#F3BA2F]">{mockUserData.totalReward}</p>
          <p className="text-xs text-white/30 mt-1">ALX</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-white/40 mb-2">锁定中</p>
          <p className="text-xl font-bold text-white/80">{mockUserData.lockedAmount}</p>
          <p className="text-xs text-white/30 mt-1">ALX</p>
        </div>
      </div>

      {/* 质押操作区 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">质押 ALX</h2>
          <div className="text-sm text-white/40">
            余额: <span className="text-white/70 font-medium">{balance ? parseFloat(balance.formatted).toFixed(4) : '0.00'}</span>
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
            className="input-field pr-24"
          />
          <button
            onClick={handleMax}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-5 py-2.5 text-sm font-bold text-[#F3BA2F] bg-[#F3BA2F]/10 rounded-xl hover:bg-[#F3BA2F]/20 transition-all border border-[#F3BA2F]/20"
          >
            MAX
          </button>
        </div>

        {/* 收益预览 */}
        {stakeAmount && parseFloat(stakeAmount) > 0 && (
          <div className="card-highlight p-5 mb-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/50">质押数量</span>
                <span className="text-white font-semibold">{stakeAmount} ALX</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">奖励 (+{STAKING_CONFIG.rewardRate * 100}%)</span>
                <span className="text-[#F3BA2F] font-semibold">+{expectedReward} ALX</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">总计获得</span>
                <span className="text-2xl font-bold text-gradient-gold">{totalReceive} ALX</span>
              </div>
            </div>
          </div>
        )}

        {isConnected ? (
          <button
            onClick={handleStake}
            disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking}
            className="btn-primary w-full"
          >
            {isStaking ? '质押中...' : '确认质押'}
          </button>
        ) : (
          <div className="w-full py-5 bg-white/5 rounded-2xl text-white/30 text-center font-semibold border border-white/5">
            请先连接钱包
          </div>
        )}
      </div>

      {/* 释放规则 */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6">释放规则</h2>
        <div className="space-y-5">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3BA2F] to-[#C99A1D] flex items-center justify-center text-black font-bold shrink-0">
              1
            </div>
            <div className="pt-1">
              <p className="text-white font-semibold mb-1">质押奖励</p>
              <p className="text-sm text-white/40 leading-relaxed">
                质押 ALX 即可获得 {STAKING_CONFIG.rewardRate * 100}% 奖励
              </p>
            </div>
          </div>

          <div className="divider" />

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3BA2F] to-[#C99A1D] flex items-center justify-center text-black font-bold shrink-0">
              2
            </div>
            <div className="pt-1">
              <p className="text-white font-semibold mb-1">锁定期</p>
              <p className="text-sm text-white/40 leading-relaxed">
                {STAKING_CONFIG.lockPeriodDays} 天后解锁 {STAKING_CONFIG.initialUnlockRate * 100}%
              </p>
            </div>
          </div>

          <div className="divider" />

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3BA2F] to-[#C99A1D] flex items-center justify-center text-black font-bold shrink-0">
              3
            </div>
            <div className="pt-1">
              <p className="text-white font-semibold mb-1">线性释放</p>
              <p className="text-sm text-white/40 leading-relaxed">
                剩余 {(1 - STAKING_CONFIG.initialUnlockRate) * 100}% 在 {STAKING_CONFIG.vestingDays} 天内按天释放
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
