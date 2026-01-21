# ALX POOL - Staking DApp

ALX POOL 是一个基于 Next.js 16 和 Hardhat v3 构建的质押挖矿 DApp，采用赛博朋克风格设计。

## 技术栈

### 前端
- **Next.js 16** - React 框架 (App Router)
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Wagmi** - Web3 React Hooks
- **Viem** - 以太坊交互库

### 智能合约
- **Hardhat v3** - 开发环境
- **Solidity** - 智能合约语言
- **OpenZeppelin** - 合约库
- **Hardhat Ignition** - 部署工具

## 项目结构

```
alx-pool/
├── contracts/          # Solidity 智能合约
├── ignition/          # Hardhat Ignition 部署模块
├── scripts/           # 部署和工具脚本
├── test/              # 合约测试
├── src/               # Next.js 前端源码
│   ├── app/          # App Router 页面
│   └── components/   # React 组件
└── public/           # 静态资源
```


## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置:

```bash
cp .env.example .env
```

### 3. 编译合约

```bash
npx hardhat compile
```

### 4. 运行测试

```bash
# 运行所有测试
npx hardhat test

# 只运行 Solidity 测试
npx hardhat test solidity

# 只运行 Node.js 测试
npx hardhat test nodejs
```

### 5. 启动本地开发网络

```bash
npx hardhat node
```

### 6. 部署合约

```bash
# 部署到本地网络
npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost

# 部署到 Sepolia 测试网
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

### 7. 启动前端开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 开发指南

### 智能合约开发

合约文件位于 `contracts/` 目录。修改合约后需要重新编译:

```bash
npx hardhat compile
```

### 前端开发

- 页面路由: `src/app/`
- 组件: `src/components/`
- 样式: 使用 Tailwind CSS

## License

/