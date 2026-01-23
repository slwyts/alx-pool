import type { Metadata, Viewport } from "next";
import { Rajdhani, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";

const rajdhani = Rajdhani({
  weight: ['300', '500', '700'],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const notoSansSC = Noto_Sans_SC({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "ALX POOL - DApp",
  description: "ALX Staking Pool DApp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${rajdhani.variable} ${notoSansSC.variable} antialiased min-h-screen pb-24`}>
        {/* 背景装饰 */}
        <div className="bg-grid-pattern" />
        <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-[-1]" />

        {/* 顶部导航 */}
        <Header />

        {/* 主内容区域 */}
        <main className="p-5 space-y-6">
          {children}
        </main>

        {/* 底部导航 */}
        <BottomNav />

        {/* Toast */}
        <Toast />
      </body>
    </html>
  );
}
