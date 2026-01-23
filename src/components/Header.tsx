'use client'

import { WalletConnect } from './WalletConnect'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5 safe-top">
      <div className="flex items-center justify-between h-16 px-5 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
        <WalletConnect />
      </div>
    </header>
  )
}
