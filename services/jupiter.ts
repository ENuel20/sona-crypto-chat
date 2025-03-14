import type { SwapRoute } from "@/contexts/SwapContext"

// This is a mock implementation for demo purposes
// In a real application, this would call the Jupiter Aggregator API
export async function getSwapQuote(inputToken: string, outputToken: string, amount: number): Promise<SwapRoute[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock token prices for calculation
  const tokenPrices: Record<string, number> = {
    SOL: 150,
    USDC: 1,
    SONIC: 2.5,
  }

  // Calculate output amount based on token prices
  const inputPrice = tokenPrices[inputToken] || 1
  const outputPrice = tokenPrices[outputToken] || 1
  const baseOutputAmount = (amount * inputPrice) / outputPrice

  // Generate mock routes with slight variations
  return [
    {
      id: "route_1",
      inputToken,
      outputToken,
      inputAmount: amount,
      outputAmount: baseOutputAmount * 0.998, // 0.2% slippage
      priceImpact: 0.15,
      fee: amount * inputPrice * 0.0005, // 0.05% fee
      provider: "Jupiter (Orca)",
    },
    {
      id: "route_2",
      inputToken,
      outputToken,
      inputAmount: amount,
      outputAmount: baseOutputAmount * 0.997, // 0.3% slippage
      priceImpact: 0.18,
      fee: amount * inputPrice * 0.0003, // 0.03% fee
      provider: "Jupiter (Raydium)",
    },
    {
      id: "route_3",
      inputToken,
      outputToken,
      inputAmount: amount,
      outputAmount: baseOutputAmount * 0.995, // 0.5% slippage
      priceImpact: 0.22,
      fee: amount * inputPrice * 0.0002, // 0.02% fee
      provider: "Jupiter (Meteora)",
    },
  ]
}

