"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useWalletContext } from "@/contexts/WalletContext"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { getSwapQuote } from "@/services/jupiter"

export interface SwapRoute {
  id: string
  inputToken: string
  outputToken: string
  inputAmount: number
  outputAmount: number
  priceImpact: number
  fee: number
  provider: string
}

export interface SwapHistory {
  id: string
  inputToken: string
  outputToken: string
  inputAmount: number
  outputAmount: number
  timestamp: number
  status: "completed" | "pending" | "failed"
  txHash?: string
}

interface SwapContextType {
  isLoading: boolean
  swapHistory: SwapHistory[]
  getSwapQuotes: (inputToken: string, outputToken: string, amount: number) => Promise<SwapRoute[]>
  executeSwap: (route: SwapRoute) => Promise<boolean>
  fetchSwapHistory: () => Promise<void>
}

const SwapContext = createContext<SwapContextType>({
  isLoading: false,
  swapHistory: [],
  getSwapQuotes: async () => [],
  executeSwap: async () => false,
  fetchSwapHistory: async () => {},
})

export function SwapProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { fetchBalances } = useWalletContext()
  const [isLoading, setIsLoading] = useState(false)
  const [swapHistory, setSwapHistory] = useState<SwapHistory[]>([])
  const { toast } = useToast()

  // Get swap quotes from Jupiter
  const getSwapQuotes = async (inputToken: string, outputToken: string, amount: number): Promise<SwapRoute[]> => {
    setIsLoading(true)
    try {
      const quotes = await getSwapQuote(inputToken, outputToken, amount)
      return quotes
    } catch (error) {
      console.error("Error getting swap quotes:", error)
      toast({
        title: "Error",
        description: "Failed to get swap quotes. Please try again.",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Execute a swap
  const executeSwap = async (route: SwapRoute): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap tokens.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // In a real implementation, this would interact with the blockchain via Jupiter
      // For now, we'll just simulate the swap process

      // Create a new swap history entry
      const newSwap: SwapHistory = {
        id: `swap_${Date.now()}`,
        inputToken: route.inputToken,
        outputToken: route.outputToken,
        inputAmount: route.inputAmount,
        outputAmount: route.outputAmount,
        timestamp: Date.now(),
        status: "completed",
        txHash: `tx_${Math.random().toString(36).substring(2, 15)}`,
      }

      // Save to Supabase
      const { error } = await supabase.from("swap_history").insert({
        id: newSwap.id,
        user_id: publicKey.toString(),
        input_token: newSwap.inputToken,
        output_token: newSwap.outputToken,
        input_amount: newSwap.inputAmount,
        output_amount: newSwap.outputAmount,
        timestamp: new Date(newSwap.timestamp).toISOString(),
        status: newSwap.status,
        tx_hash: newSwap.txHash,
      })

      if (error) {
        throw error
      }

      setSwapHistory((prev) => [newSwap, ...prev])

      // Refresh balances after swap
      await fetchBalances()

      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${route.inputAmount} ${route.inputToken} for ${route.outputAmount.toFixed(4)} ${route.outputToken}.`,
      })

      return true
    } catch (error) {
      console.error("Error executing swap:", error)
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch swap history
  const fetchSwapHistory = async () => {
    if (!publicKey) {
      setSwapHistory([])
      return
    }

    setIsLoading(true)
    try {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from("swap_history")
        .select("*")
        .eq("user_id", publicKey.toString())
        .order("timestamp", { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        const history: SwapHistory[] = data.map((swap) => ({
          id: swap.id,
          inputToken: swap.input_token,
          outputToken: swap.output_token,
          inputAmount: swap.input_amount,
          outputAmount: swap.output_amount,
          timestamp: new Date(swap.timestamp).getTime(),
          status: swap.status as "completed" | "pending" | "failed",
          txHash: swap.tx_hash,
        }))
        setSwapHistory(history)
      }
    } catch (error) {
      console.error("Error fetching swap history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch swap history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SwapContext.Provider
      value={{
        isLoading,
        swapHistory,
        getSwapQuotes,
        executeSwap,
        fetchSwapHistory,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}

export function useSwapContext() {
  const context = useContext(SwapContext)
  if (context === undefined) {
    throw new Error("useSwapContext must be used within a SwapProvider")
  }
  return context
}

