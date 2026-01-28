"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useBlockNumber, useBlock } from "wagmi";
import { formatUnits, parseUnits, type Abi } from "viem";
import { ALXStakingPoolABI, MockALXABI, contractAddresses } from "./index";

const stakingPoolAbi = ALXStakingPoolABI as Abi;
const tokenAbi = MockALXABI as Abi;

// ==================== 区块链时间 ====================

/** 获取当前区块链时间戳 */
export function useBlockTimestamp() {
  const { data: block } = useBlock({ watch: true });
  return block ? Number(block.timestamp) : Math.floor(Date.now() / 1000);
}

// ==================== 读取合约配置 ====================

/** 读取质押池配置参数 */
export function usePoolConfig() {
  const { data: bonusRate } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "bonusRate",
  });

  const { data: lockDuration } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "lockDuration",
  });

  const { data: linearDuration } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "linearDuration",
  });

  const { data: initialUnlockRate } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "initialUnlockRate",
  });

  const { data: owner } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "owner",
  });

  const { data: withdrawFeeRate } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "withdrawFeeRate",
  });

  return {
    // 奖励比例 (基点 -> 小数, 5000 -> 0.5)
    bonusRate: bonusRate ? Number(bonusRate) / 10000 : undefined,
    // 锁仓天数 (秒 -> 天)
    lockDays: lockDuration ? Number(lockDuration) / 86400 : undefined,
    // 线性释放天数
    linearDays: linearDuration ? Number(linearDuration) / 86400 : undefined,
    // 首期解锁比例 (基点 -> 小数)
    initialRate: initialUnlockRate ? Number(initialUnlockRate) / 10000 : undefined,
    // 合约 owner
    owner: owner as `0x${string}` | undefined,
    // 提现手续费率 (基点 -> 小数)
    withdrawFeeRate: withdrawFeeRate ? Number(withdrawFeeRate) / 10000 : undefined,
  };
}

// ==================== 用户相关 ====================

/** 读取质押池总质押量 */
export function useTotalStaked() {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "totalStaked",
  });

  const total = data as bigint | undefined;
  return {
    totalStaked: total,
    totalStakedFormatted: total ? formatUnits(total, 18) : "0",
    refetch,
    isLoading,
  };
}

/** 读取用户 ALX 余额 */
export function useALXBalance(address: `0x${string}` | undefined) {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddresses.alxToken,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const balance = data as bigint | undefined;
  return {
    balance,
    balanceFormatted: balance ? formatUnits(balance, 18) : "0",
    refetch,
    isLoading,
  };
}

/** 读取用户对质押池的授权额度 */
export function useALXAllowance(address: `0x${string}` | undefined) {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddresses.alxToken,
    abi: tokenAbi,
    functionName: "allowance",
    args: address ? [address, contractAddresses.stakingPool] : undefined,
    query: { enabled: !!address },
  });

  const allowance = data as bigint | undefined;
  return {
    allowance,
    allowanceFormatted: allowance ? formatUnits(allowance, 18) : "0",
    refetch,
    isLoading,
  };
}

/** 读取用户所有质押记录 ID */
export function useUserStakeIds(address: `0x${string}` | undefined) {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "getUserIds",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    stakeIds: data as bigint[] | undefined,
    refetch,
    isLoading,
  };
}

/** 读取单条质押记录详情 */
export function useStakeRecord(stakeId: bigint | undefined) {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "stakes",
    args: stakeId !== undefined ? [stakeId] : undefined,
    query: { enabled: stakeId !== undefined },
  });

  if (!data) return { record: undefined, refetch, isLoading };

  const record = data as [bigint, `0x${string}`, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
  const [id, user, principal, totalReward, startTime, claimedAmount, lockDuration, linearDuration, initialUnlockRate] = record;

  return {
    record: {
      id: Number(id),
      user,
      principal,
      principalFormatted: formatUnits(principal, 18),
      totalReward,
      totalRewardFormatted: formatUnits(totalReward, 18),
      startTime: Number(startTime),
      claimedAmount,
      claimedAmountFormatted: formatUnits(claimedAmount, 18),
      lockDuration: Number(lockDuration),
      linearDuration: Number(linearDuration),
      initialUnlockRate: Number(initialUnlockRate),
    },
    refetch,
    isLoading,
  };
}

/** 读取可领取金额 */
export function usePendingAmount(stakeId: bigint | undefined) {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "getPendingAmount",
    args: stakeId !== undefined ? [stakeId] : undefined,
    query: { enabled: stakeId !== undefined },
  });

  const pending = data as bigint | undefined;
  return {
    pending,
    pendingFormatted: pending ? formatUnits(pending, 18) : "0",
    refetch,
    isLoading,
  };
}

// ==================== 写入操作 ====================

/** 授权 ALX 给质押池 */
export function useApproveALX() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: string) => {
    const amountWei = parseUnits(amount, 18);
    writeContract({
      address: contractAddresses.alxToken,
      abi: tokenAbi,
      functionName: "approve",
      args: [contractAddresses.stakingPool, amountWei],
    });
  };

  const approveMax = () => {
    writeContract({
      address: contractAddresses.alxToken,
      abi: tokenAbi,
      functionName: "approve",
      args: [contractAddresses.stakingPool, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
    });
  };

  return { approve, approveMax, hash, isPending, isConfirming, isSuccess, error };
}

/** 质押 ALX */
export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (amount: string) => {
    const amountWei = parseUnits(amount, 18);
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "stake",
      args: [amountWei],
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error };
}

/** 领取收益 */
export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = (stakeId: bigint) => {
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "claim",
      args: [stakeId],
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}

// ==================== 管理员操作 ====================

/** 管理员代客质押 */
export function useAdminStakeForUser() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adminStake = (userAddress: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, 18);
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "adminStakeForUser",
      args: [userAddress, amountWei],
    });
  };

  return { adminStake, hash, isPending, isConfirming, isSuccess, error };
}

/** 管理员批量代客质押 */
export function useAdminBatchStakeForUsers() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adminBatchStake = (users: `0x${string}`[], amounts: string[]) => {
    const amountsWei = amounts.map(a => parseUnits(a, 18));
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "adminBatchStakeForUsers",
      args: [users, amountsWei],
    });
  };

  return { adminBatchStake, hash, isPending, isConfirming, isSuccess, error };
}

/** 管理员查询用户所有仓位 */
export function useAdminGetUserStakes(userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: contractAddresses.stakingPool,
    abi: stakingPoolAbi,
    functionName: "adminGetUserStakes",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const stakes = data as Array<{
    id: bigint;
    user: `0x${string}`;
    principal: bigint;
    totalReward: bigint;
    startTime: bigint;
    claimedAmount: bigint;
    lockDuration: bigint;
    linearDuration: bigint;
    initialUnlockRate: bigint;
  }> | undefined;

  const formattedStakes = stakes?.filter(s => s.user !== '0x0000000000000000000000000000000000000000').map(s => ({
    id: Number(s.id),
    user: s.user,
    principal: formatUnits(s.principal, 18),
    totalReward: formatUnits(s.totalReward, 18),
    startTime: Number(s.startTime),
    claimedAmount: formatUnits(s.claimedAmount, 18),
    lockDuration: Number(s.lockDuration) / 86400,
    linearDuration: Number(s.linearDuration) / 86400,
    initialUnlockRate: Number(s.initialUnlockRate) / 10000,
  }));

  return { stakes: formattedStakes, isLoading, refetch };
}

/** 管理员强制关闭仓位 */
export function useAdminCloseStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const closeStake = (stakeId: number) => {
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "adminCloseStake",
      args: [BigInt(stakeId)],
    });
  };

  return { closeStake, hash, isPending, isConfirming, isSuccess, error };
}

/** 管理员更新配置 */
export function useUpdateConfig() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateConfig = (bonusRate: number, lockDays: number, linearDays: number, initialRate: number) => {
    // bonusRate: 小数 -> 基点 (0.5 -> 5000)
    const bonusRateBps = BigInt(Math.round(bonusRate * 10000));
    const initialRateBps = BigInt(Math.round(initialRate * 10000));
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "updateConfig",
      args: [bonusRateBps, BigInt(lockDays), BigInt(linearDays), initialRateBps],
    });
  };

  return { updateConfig, hash, isPending, isConfirming, isSuccess, error };
}

/** 管理员紧急提币 */
export function useEmergencyWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const emergencyWithdraw = (tokenAddress: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, 18);
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "emergencyWithdraw",
      args: [tokenAddress, amountWei],
    });
  };

  return { emergencyWithdraw, hash, isPending, isConfirming, isSuccess, error };
}

/** 管理员设置提现手续费率 */
export function useSetWithdrawFeeRate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setWithdrawFeeRate = (feeRate: number) => {
    // feeRate: 小数 -> 基点 (0.1 -> 1000)
    const feeRateBps = BigInt(Math.round(feeRate * 10000));
    writeContract({
      address: contractAddresses.stakingPool,
      abi: stakingPoolAbi,
      functionName: "setWithdrawFeeRate",
      args: [feeRateBps],
    });
  };

  return { setWithdrawFeeRate, hash, isPending, isConfirming, isSuccess, error };
}
