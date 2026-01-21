ALX POOL DApp 开发规划方案书1. 项目概述 (Project Overview)项目名称: ALX POOL核心资产: ALX (ERC20) - 由商城积分兑换而来核心功能: 质押挖矿 (Staking) + 官方公告 (Announcements)视觉风格: 赛博朋克 / 未来科技风 (Cyberpunk / High-Tech)2. 技术架构 (Technical Architecture)2.1 区块链层 (Smart Contracts)鉴于 ALX 是标准 ERC20，我们需要开发一套安全的质押合约。目标网络: (待定: Ethereum / BSC / Polygon / L2) 建议选择 Gas 费较低的网络。核心合约: StakingRewards.sol (基于 Synthetix 经典质押模型修改)Stake (质押): 用户存入 ALX。Withdraw (提取): 用户取回本金。GetReward (领取奖励): 用户领取挖出的 ALX (或其他奖励代币)。Exit (退出): 提取本金 + 领取奖励。NotifyRewardAmount (注入奖励): 管理员功能，用于向池子注入奖励。2.2 前端交互层 (Frontend)框架: React (Next.js) + Tailwind CSSWeb3 库: Wagmi + Viem (或 RainbowKit) 用于钱包连接。数据读取: 使用 useReadContract 读取 APR、TVL (总锁仓量)、用户余额。2.3 数据/后端层 (Backend - 轻量化)公告系统:方案 A (去中心化): 公告哈希上链，内容存 IPFS (成本高，不推荐)。方案 B (静态配置): 作为一个 JSON 文件托管在前端，更新公告即更新代码 (最省钱，适合更新不频繁)。方案 C (轻后端): 使用 Firebase 或 Supabase 存储公告，管理员后台动态发布 (推荐，用户体验最好)。3. 功能板块设计 (Feature Modules)A. 仪表盘 / 首页 (Dashboard)钱包连接: 支持 MetaMask, OKX Wallet 等。数据看板: 展示当前 ALX 价格、全网总质押量 (TVL)、当前年化收益率 (APY)。B. 质押核心 (Staking Pool)操作面板:输入框: 输入质押数量 (支持 "Max" 按钮)。授权 (Approve): 首次使用需授权合约操作 ALX。质押 (Stake) / 解押 (Unstake) 切换。收益展示:实时跳动的“待领取奖励” (Pending Rewards)。一键领取 (Claim) 按钮。C. 公告中心 (News Hub)布局: 滚动新闻条或卡片式列表。内容: 商城活动更新、积分兑换比例调整、ALX 赋能通知。视觉: 采用全息投影或终端命令行的样式。4. UI/UX 设计理念：赛博朋克 (Cyberpunk)配色:背景: 深黑 (#050505) 或 深蓝黑 (#0a0b1e)。主色: 霓虹青 (#00f3ff) - 代表科技/数据。辅色: 激光紫 (#bc13fe) - 代表 赛博/叛逆。警告/高亮: 荧光黄 (#fcee0a)。元素:发光边框 (Glow Effects)。故障艺术 (Glitch Effects) 字体。网格背景 (Grid Lines)。HUD (平视显示器) 风格的数据展示。5. 开发里程碑 (Roadmap)阶段任务描述预计周期P1: 合约开发编写 ERC20 接口与质押合约，完成测试网部署与 Gas 优化。3-5 天P2: UI设计与实现完成赛博朋克风格组件库搭建，响应式布局适配。3-4 天P3: Web3 联调前端对接合约接口 (Approve/Stake/Claim)，处理链上异常。3-4 天P4: 测试与部署邀请小范围用户测试，UI 细节打磨，正式网部署。2-3 天6. 安全注意 (Security Checklist)重入攻击保护: 合约必须使用 ReentrancyGuard。数值溢出: 使用 Solidity 0.8.x 版本自动防护。权限管理: 确保只有 Admin 可以设置奖励率，但 Admin 不能动用用户本金。7. 仓库代码结构 (Repository Structure)建议使用 Monorepo 风格，将合约层与前端层分开管理，结构清晰且易于部署。alx-pool-dapp/
├── README.md                   # 项目总说明 (如何启动、环境配置)
├── .gitignore                  # 全局 Git 忽略配置
│
├── 📂 blockchain/              # 智能合约层 (建议使用 Hardhat 或 Foundry)
│   ├── contracts/              # Solidity 源码
│   │   ├── AlxToken.sol        # (可选) 本地测试用的模拟 Token
│   │   ├── StakingPool.sol     # 核心质押业务合约
│   │   └── interfaces/         # 接口定义 (IStaking.sol)
│   ├── scripts/                # 部署与测试脚本 (deploy.js)
│   ├── test/                   # 合约单元测试 (非常重要，尤其是涉及资金)
│   ├── hardhat.config.ts       # Hardhat 配置文件
│   └── .env                    # 私钥、RPC 节点 (绝对不要上传 GitHub)
│
└── 📂 frontend/                # 前端交互层 (Next.js + Tailwind)
    ├── public/                 # 静态资源 (Logo, Icons, Fonts)
    ├── src/
    │   ├── app/                # Next.js 页面路由 (App Router)
    │   │   ├── page.tsx        # 主页 (Dashboard)
    │   │   └── layout.tsx      # 全局布局 (Navbar, Footer, Providers)
    │   ├── components/         # React 组件
    │   │   ├── ui/             # 基础 UI (Button, Card, Modal) - 赛博朋克样式库
    │   │   └── staking/        # 业务组件 (StakeForm, StatsCard, RewardPanel)
    │   ├── hooks/              # Web3 Hooks (useStaking, useApprove)
    │   ├── lib/                # 工具库
    │   │   ├── wagmi.ts        # 钱包连接配置 (Config)
    │   │   ├── contracts.ts    # 合约地址 & ABI JSON (前后端对接点)
    │   │   └── utils.ts        # 格式化工具 (如 formatEther)
    │   └── styles/             # 全局样式 (globals.css, tailwind.config)
    └── next.config.js          # Next.js 配置
关键点说明：前后端分离但同源：blockchain 文件夹负责逻辑（Solidity），frontend 文件夹负责界面（Next.js）。对接桥梁 (frontend/src/lib/contracts.ts)：当你完成合约部署后，需要将生成的 ABI (JSON) 和 合约地址 复制到这里，前端才能调用合约。UI 组件库 (components/ui)：因为你需要“赛博朋克风”，这里会存放很多自定义的 CSS 组件，比如带发光效果的边框、故障风按钮等，复用性很高。