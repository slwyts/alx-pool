'use client'

import { Coins, Bell, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: 'stake' | 'announcements' | 'profile'
  onTabChange: (tab: 'stake' | 'announcements' | 'profile') => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'stake' as const, label: '质押', icon: Coins },
    { id: 'announcements' as const, label: '公告', icon: Bell },
    { id: 'profile' as const, label: '我的', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all active:scale-95"
            >
              <div className={`p-2.5 rounded-2xl transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-[#F3BA2F]/20 to-[#F3BA2F]/5 shadow-lg shadow-[#F3BA2F]/10'
                  : ''
              }`}>
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-[#F3BA2F]' : 'text-white/30'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </div>
              <span className={`text-xs transition-all ${
                isActive
                  ? 'text-[#F3BA2F] font-semibold'
                  : 'text-white/30 font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
