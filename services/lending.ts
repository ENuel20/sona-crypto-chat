import type { LendingPool } from "@/contexts/LendingContext"

// This is a mock implementation for demo purposes
// In a real application, this would fetch data from Solend, Jet Protocol, etc.
export async function getLendingPools(): Promise<LendingPool[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Return mock lending pools
  return [
    {
      id: "solend_sol",
      name: "Solend - SOL",
      token: "SOL",
      supplyApy: 3.2,
      borrowApy: 5.8,
      totalSupply: 18500000,
      totalBorrow: 12000000,
      availableLiquidity: 6500000,
      ltv: 0.8, // 80% loan-to-value ratio
      provider: "Solend",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "solend_usdc",
      name: "Solend - USDC",
      token: "USDC",
      supplyApy: 4.5,
      borrowApy: 6.2,
      totalSupply: 25000000,
      totalBorrow: 18000000,
      availableLiquidity: 7000000,
      ltv: 0.9, // 90% loan-to-value ratio
      provider: "Solend",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "jet_sol",
      name: "Jet Protocol - SOL",
      token: "SOL",
      supplyApy: 3.5,
      borrowApy: 5.5,
      totalSupply: 12000000,
      totalBorrow: 8000000,
      availableLiquidity: 4000000,
      ltv: 0.75, // 75% loan-to-value ratio
      provider: "Jet Protocol",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "jet_usdc",
      name: "Jet Protocol - USDC",
      token: "USDC",
      supplyApy: 4.8,
      borrowApy: 6.0,
      totalSupply: 15000000,
      totalBorrow: 10000000,
      availableLiquidity: 5000000,
      ltv: 0.85, // 85% loan-to-value ratio
      provider: "Jet Protocol",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "sonic_pool",
      name: "Sonic Lending - SONIC",
      token: "SONIC",
      supplyApy: 6.5,
      borrowApy: 9.2,
      totalSupply: 5000000,
      totalBorrow: 3000000,
      availableLiquidity: 2000000,
      ltv: 0.7, // 70% loan-to-value ratio
      provider: "Sonic SVM",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
  ]
}

