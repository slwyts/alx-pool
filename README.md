ALX POOL - Technical Documentation

Project Name: ALX POOL
Type: ERC20 Staking DApp
Architecture: Monorepo (Next.js + Hardhat)

1. 项目概述 (Project Overview)

ALX POOL 是 ALX 生态的去中心化应用（DApp），主要用于承接商城积分兑换出的 ALX 代币。
核心业务逻辑为用户将 ALX 代币存入智能合约进行质押（Staking），从而获得奖励收益。

业务目标：

提供安全的质押和解押功能。

提供清晰的收益数据看板（TVL, APY, User Balance）。

展示项目方的系统日志或公告信息。

2. 技术栈 (Technical Stack)

本项目采用全栈单体仓库（Super Monorepo）结构，统一管理合约端与前端代码。

Runtime: Node.js v20+ (LTS)

Smart Contract:

Framework: Hardhat V3（Viem tools）

Library: Viem (用于测试与交互)

Base Logic: Synthetix StakingRewards.sol

Frontend:

Framework: Next.js 16+ (App Router)

Language: TypeScript

UI Library: Tailwind CSS + Lucide Icons

Web3 Hooks: Wagmi v3

Package Manager: NPM

3. 工程结构 (Project Structure)

所有代码位于根目录下，区分 contracts (后端逻辑) 与 app (前端逻辑)。

alx-pool/
├── contracts/           # Solidity 智能合约源码
├── scripts/             # 合约部署与交互脚本
├── test/                # Hardhat 测试用例
├── app/                 # Next.js 页面路由 (Frontend)
├── components/          # React UI 组件
├── lib/                 # 工具函数 (Web3 Config, Utils)
├── hardhat.config.ts    # Hardhat 配置文件
├── next.config.js       # Next.js 配置文件
├── tailwind.config.ts   # 样式配置文件
└── package.json         # 统一依赖管理


4. 视觉设计规范 (Visual Design System) - CRITICAL本章节定义了 DApp 的 UI 灵魂。AI 必须严格遵守以下参数构建组件。4.1 核心概念：数字黑石 (Digital Obsidian)背景 (Background):页面不使用纯色，而是使用深度渐变模拟深邃的空间感。Base: #000000 (纯黑)Gradient: bg-gradient-to-b from-slate-950 to-black (从极深蓝灰到纯黑)。材质 (Material):磨砂玻璃 (Frosted Glass): 所有卡片、面板必须使用高斯模糊背景。Class: bg-white/5 backdrop-blur-md border border-white/10光效 (Lighting):仅在交互时（Hover/Active）出现微弱的光晕，模拟光线穿过玻璃。颜色：香槟金 (Champagne Gold)。4.2 配色方案 (Color Palette)角色色值 (Hex)Tailwind Class用途Canvas#020617bg-slate-950全局背景底色Surface#FFFFFF (5% Opacity)bg-white/5卡片容器、输入框背景Primary Text#FFFFFFtext-white标题、核心数值Secondary Text#94A3B8text-slate-400标签、辅助说明Brand Accent#FCD34Dtext-amber-300强调色：按钮、高亮边框、关键数据Success#10B981text-emerald-500APY 数值、正向涨幅Border#FFFFFF (10% Opacity)border-white/10组件的极细边框4.3 排版与字体 (Typography)Display Font (数字/标题): Orbitron 或 Rajdhani。特征：宽间距 (tracking-widest)，字重较轻 (font-light)，营造未来感。Body Font (正文): Inter 或 Manrope。特征：高可读性，商务风格。4.4 组件样式 (Component Guidelines)A. 质押卡片 (Staking Card)外观: 悬浮在黑色背景上的半透明玻璃板。边框: 极细的 1px 边框，颜色为 border-white/10。输入框: 深色沉浸式设计。bg-black/40 border border-slate-800 focus:border-amber-400/50。B. 按钮 (Buttons)Primary:背景：bg-amber-400 (高亮) 或 bg-gradient-to-r from-amber-200 to-amber-500。文字：text-black font-bold。效果：Hover 时产生微弱的金色辉光 shadow-[0_0_20px_rgba(251,191,36,0.3)]。Secondary:幽灵按钮。border border-slate-600 text-slate-300 hover:bg-white/5。5. 功能模块 (Features)Dashboard: 实时显示 TVL (总锁仓)、ALX 价格、APY。Staking Panel:输入框支持 "Max" 按钮。动态计算 "Est. Daily Earnings" (预估日收益)。System Logs:位于侧边或底部的滚动日志。样式模仿金融终端的数据流 (Data Feed)，单色、等宽字体。

5. 核心功能模块 (Core Features)

5.1 Dashboard (仪表盘)

数据展示: Total Value Locked (TVL), Annual Percentage Yield (APY), ALX Price.

状态同步: 需实时从链上读取合约状态。

5.2 Staking System (质押系统)

Stake: 用户调用 stake(amount) 存入代币。

Withdraw: 用户调用 withdraw(amount) 提取本金。

Claim: 用户调用 getReward() 领取收益。

Exit: 一键执行 withdraw + getReward。