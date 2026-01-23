'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showMenu, setShowMenu] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{formatAddress(address)}</span>
          <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#141414] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-xl shadow-black/50">
              <div className="px-4 py-4 border-b border-white/10">
                <p className="text-xs text-white/40 mb-1">已连接</p>
                <p className="text-sm text-white font-mono font-semibold">{formatAddress(address)}</p>
              </div>
              <button
                onClick={() => {
                  disconnect()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                断开连接
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        const injectedConnector = connectors.find(c => c.id === 'injected')
        if (injectedConnector) {
          connect({ connector: injectedConnector })
        }
      }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3BA2F] to-[#C99A1D] text-black text-sm font-bold hover:shadow-lg hover:shadow-[#F3BA2F]/20 transition-all active:scale-95"
    >
      <Wallet className="w-4 h-4" />
      连接钱包
    </button>
  )
}
