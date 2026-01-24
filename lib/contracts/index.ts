// Import ABIs from hardhat build artifacts
import ALXStakingPoolArtifact from "@/artifacts/contracts/ALXStakingPool.sol/ALXStakingPool.json";
import MockALXArtifact from "@/artifacts/contracts/MockALX.sol/MockALX.json";

export const ALXStakingPoolABI = ALXStakingPoolArtifact.abi;
export const MockALXABI = MockALXArtifact.abi;

// Contract addresses from environment
export const contractAddresses = {
  stakingPool: process.env.NEXT_PUBLIC_STAKING_POOL_ADDRESS as `0x${string}`,
  alxToken: process.env.NEXT_PUBLIC_ALX_TOKEN_ADDRESS as `0x${string}`,
} as const;
