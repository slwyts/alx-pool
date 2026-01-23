'use client'

import { ChevronRight } from 'lucide-react'

const mockAnnouncements = [
  {
    id: 1,
    title: '欢迎使用 ALX 质押平台',
    content: 'ALX 质押平台正式上线，质押 ALX 即可获得 50% 奖励。',
    date: '2026-01-23',
    isNew: true,
  },
  {
    id: 2,
    title: '释放规则说明',
    content: '质押后锁定期为 3 个月，届时解锁 10%，剩余 90% 在 270 天内按天线性释放。',
    date: '2026-01-22',
    isNew: true,
  },
  {
    id: 3,
    title: '安全提示',
    content: '请确保您使用的是官方网站，谨防钓鱼网站。官方不会主动索要您的私钥或助记词。',
    date: '2026-01-21',
    isNew: false,
  },
]

export function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="hero-gradient -mx-5 px-5 pt-4 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            公告中心
          </h1>
          <p className="text-lg text-white/50">
            了解最新动态与重要通知
          </p>
        </div>
      </div>

      {/* 公告列表 */}
      <div className="space-y-4">
        {mockAnnouncements.map((item) => (
          <div
            key={item.id}
            className="card p-5 hover:bg-white/[0.04] transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                  {item.isNew && (
                    <span className="tag text-xs py-1 px-3">NEW</span>
                  )}
                </div>
                <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">
                  {item.content}
                </p>
                <p className="text-white/20 text-xs">{item.date}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-[#F3BA2F]/50 transition-colors shrink-0 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {mockAnnouncements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <span className="text-4xl">📭</span>
          </div>
          <p className="text-white/30 text-lg">暂无公告</p>
        </div>
      )}
    </div>
  )
}
