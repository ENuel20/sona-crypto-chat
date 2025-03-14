import type { StakingPool } from "@/contexts/StakingContext"

// This is a mock implementation for demo purposes
// In a real application, this would fetch data from Solana validators, Marinade, Jito, etc.
export async function getStakingPools(): Promise<StakingPool[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock staking pools
  return [
    {
      id: "native_sol_1",
      name: "Solana Validator - Everstake",
      token: "SOL",
      apy: 6.8,
      tvl: 12500000,
      minStake: 0.1,
      lockupPeriod: 0, // No lockup for native staking
      isLiquid: false,
      provider: "Solana",
      description: "Stake your SOL with Everstake, one of the largest validators on Solana.",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "native_sol_2",
      name: "Solana Validator - Chorus One",
      token: "SOL",
      apy: 6.5,
      tvl: 9800000,
      minStake: 0.1,
      lockupPeriod: 0,
      isLiquid: false,
      provider: "Solana",
      description: "Chorus One is a highly reliable validator with excellent uptime.",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "liquid_sol_1",
      name: "Marinade Finance",
      token: "SOL",
      apy: 7.2,
      tvl: 45000000,
      minStake: 0.01,
      lockupPeriod: 0,
      isLiquid: true,
      provider: "Marinade",
      description: "Liquid staking solution that gives you mSOL in return for your staked SOL.",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "liquid_sol_2",
      name: "Jito",
      token: "SOL",
      apy: 7.5,
      tvl: 38000000,
      minStake: 0.01,
      lockupPeriod: 0,
      isLiquid: true,
      provider: "Jito",
      description: "Liquid staking with MEV extraction for higher yields.",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "sonic_1",
      name: "Sonic HyperGrid - Validator",
      token: "SONIC",
      apy: 8.5,
      tvl: 5000000,
      minStake: 10,
      lockupPeriod: 7, // 7 days
      isLiquid: false,
      provider: "Sonic SVM",
      description: "Stake SONIC with validators to secure the Sonic SVM network.",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "sonic_2",
      name: "Sonic HyperGrid - Node",
      token: "SONIC",
      apy: 10.2,
      tvl: 3500000,
      minStake: 50,
      lockupPeriod: 14, // 14 days
      isLiquid: false,
      provider: "Sonic SVM",
      description: "Run a node on the Sonic SVM network for higher rewards.",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
  ]
}

