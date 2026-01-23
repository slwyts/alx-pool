// 质押规则配置（可调整）
export const STAKING_CONFIG = {
  // 奖励比例：质押获得 50% 奖励
  rewardRate: 0.5,
  // 锁定期：3 个月（天数）
  lockPeriodDays: 90,
  // 锁定期结束后首次解锁比例
  initialUnlockRate: 0.1,
  // 线性释放期（天数）
  vestingDays: 270,
}

// ALX 代币信息（待更新实际合约地址）
export const ALX_TOKEN = {
  address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  decimals: 18,
  symbol: 'ALX',
  name: 'ALX Token',
}

// 质押合约地址（待更新）
export const STAKING_CONTRACT = {
  address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
}
