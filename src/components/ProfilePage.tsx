'use client'

import { useAccount } from 'wagmi'
import { Copy, Check, ChevronRight, ExternalLink, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6">
          <span className="text-5xl">👤</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">未连接钱包</h2>
        <p className="text-white/40 text-center">连接钱包后查看您的账户信息</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="hero-gradient -mx-5 px-5 pt-4 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            我的账户
          </h1>
        </div>

        {/* 用户卡片 */}
        <div className="stat-card-gold">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F3BA2F] to-[#C99A1D] flex items-center justify-center shadow-lg shadow-[#F3BA2F]/20">
              <span className="text-black font-bold text-2xl">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-mono text-lg font-semibold">
                  {formatAddress(address!)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">已连接</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 资产概览 */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6">资产概览</h2>
        <div className="space-y-1">
          <div className="flex justify-between items-center py-4">
            <span className="text-white/50">累计质押</span>
            <span className="text-white font-bold text-xl">0 ALX</span>
          </div>
          <div className="divider" />
          <div className="flex justify-between items-center py-4">
            <span className="text-white/50">累计收益</span>
            <span className="text-gradient-gold font-bold text-xl">0 ALX</span>
          </div>
          <div className="divider" />
          <div className="flex justify-between items-center py-4">
            <span className="text-white/50">已领取</span>
            <span className="text-white font-bold text-xl">0 ALX</span>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="card overflow-hidden">
        <button className="w-full flex items-center justify-between p-5 hover:bg-white/[0.04] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-white font-medium text-lg">交易记录</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#F3BA2F]/50 transition-colors" />
        </button>
        <div className="divider mx-5" />
        <button className="w-full flex items-center justify-between p-5 hover:bg-white/[0.04] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-white font-medium text-lg">帮助中心</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#F3BA2F]/50 transition-colors" />
        </button>
      </div>

      {/* 版本 */}
      <p className="text-center text-white/20 text-sm py-8">
        ALX Staking v1.0.0
      </p>
    </div>
  )
}
