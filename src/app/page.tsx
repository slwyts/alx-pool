'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { StakePage } from '@/components/StakePage'
import { AnnouncementsPage } from '@/components/AnnouncementsPage'
import { ProfilePage } from '@/components/ProfilePage'

type TabType = 'stake' | 'announcements' | 'profile'

const tabTitles: Record<TabType, string> = {
  stake: 'ALX Staking',
  announcements: '公告',
  profile: '我的',
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('stake')

  return (
    <div className="min-h-screen bg-black">
      <Header title={tabTitles[activeTab]} />

      <main className="pt-16 pb-24 px-5 max-w-lg mx-auto">
        <div className="py-2">
          {activeTab === 'stake' && <StakePage />}
          {activeTab === 'announcements' && <AnnouncementsPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
