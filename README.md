# ALX POOL DApp

ALX 质押池 DApp - 基于 Next.js 16 + React 19 构建的 Web3 质押应用。

## 功能特性

- **质押页面** (`/`) - 查看全网质押数据，参与 ALX 代币质押
- **公告页面** (`/news`) - 查看系统公告和最新动态
- **我的页面** (`/mine`) - 查看账户状态、待释放资产、质押记录
- **管理员后台** (`/admin`) - 后台拨币、系统参数配置

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **状态管理**: Zustand
- **Web3**: wagmi + viem
- **图标**: Lucide React
- **字体**: Rajdhani (科技感数字) + Noto Sans SC (中文)

## 项目结构

```
app/
├── layout.tsx          # 共享布局
├── page.tsx            # / -> 质押页面
├── news/page.tsx       # /news -> 公告页面
├── mine/page.tsx       # /mine -> 我的页面
└── admin/page.tsx      # /admin -> 管理员后台

components/
├── Header.tsx          # 顶部导航（Logo、语言切换、钱包连接）
├── BottomNav.tsx       # 底部导航栏
└── Toast.tsx           # Toast 提示组件

lib/
├── i18n.ts             # 国际化（中/英）
├── types.ts            # TypeScript 类型定义
├── store.ts            # Zustand 全局状态
├── hooks.ts            # 自定义 Hooks
└── data.ts             # 静态数据
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 质押规则

| 参数 | 默认值 |
|------|--------|
| 奖励比例 | 50% |
| 锁仓周期 | 90 天 |
| 首期释放 | 10% |
| 线性释放 | 270 天 |

## 国际化

支持中文 (zh) 和英文 (en) 切换，点击顶部导航栏的语言按钮即可切换。
