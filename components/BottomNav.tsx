'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Cpu, Bell, Wallet } from 'lucide-react';
import { useTranslation } from '@/lib/hooks';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // 在 admin 页面隐藏底部导航
  if (pathname === '/admin') return null;

  const navItems = [
    { href: '/', icon: Cpu, label: 'nav_stake' },
    { href: '/news', icon: Bell, label: 'nav_news' },
    { href: '/mine', icon: Wallet, label: 'nav_mine' },
  ];

  return (
    <nav className="fixed bottom-0 w-full glass-card border-t border-white/10 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 w-16 transition-all duration-300 ${
                isActive ? 'active-nav transform -translate-y-2' : 'text-gray-500'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/10' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
