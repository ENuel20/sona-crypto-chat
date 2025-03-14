"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useWalletContext } from "@/contexts/WalletContext"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { getLendingPools } from "@/services/lending"

export interface LendingPool {
  id: string
  name: string
  token: string
  supplyApy: number
  borrowApy: number
  totalSupply: number
  totalBorrow: number
  availableLiquidity: number
  ltv: number // loan-to-value ratio
  provider: string
  logoUrl: string
}

export interface LendingPosition {
  id: string
  poolId: string
  type: "supply" | "borrow"
  amount: number
  value: number
  interestEarned?: number
  interestPaid?: number
  startDate: number
  isActive: boolean
}

interface LendingContextType {
  pools: LendingPool[]
  positions: LendingPosition[]
  isLoading: boolean
  fetchPools: () => Promise<void>
  fetchPositions: () => Promise<void>
  supplyTokens: (poolId: string, amount: number) => Promise<boolean>
  borrowTokens: (poolId: string, amount: number) => Promise<boolean>
  repayLoan: (positionId: string, amount: number) => Promise<boolean>
  withdrawSupply: (positionId: string, amount: number) => Promise<boolean>
  getTotalSupplied: () => number
  getTotalBorrowed: () => number
  getTotalInterestEarned: () => number
  getTotalInterestPaid: () => number
}

const LendingContext = createContext<LendingContextType>({
  pools: [],
  positions: [],
  isLoading: false,
  fetchPools: async () => {},
  fetchPositions: async () => {},
  supplyTokens: async () => false,
  borrowTokens: async () => false,
  repayLoan: async () => false,
  withdrawSupply: async () => false,
  getTotalSupplied: () => 0,
  getTotalBorrowed: () => 0,
  getTotalInterestEarned: () => 0,
  getTotalInterestPaid: () => 0,
})

export function LendingProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { fetchBalances } = useWalletContext()
  const [pools, setPools] = useState<LendingPool[]>([])
  const [positions, setPositions] = useState<LendingPosition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch lending pools
  const fetchPools = async () => {
    setIsLoading(true)
    try {
      const fetchedPools = await getLendingPools()
      setPools(fetchedPools)
    } catch (error) {
      console.error("Error fetching lending pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch lending pools. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's lending positions
  const fetchPositions = async () => {
    if (!publicKey) {
      setPositions([])
      return
    }

    setIsLoading(true)
    try {
      // Fetch from Supabase
      const { data, error } = await supabase.from("lending_positions").select("*").eq("user_id", publicKey.toString())

      if (error) {
        throw error
      }

      if (data) {
        const lendingPositions: LendingPosition[] = data.map((pos) => ({
          id: pos.id,
          poolId: pos.pool_id,
          type: pos.position_type as "supply" | "borrow",
          amount: pos.amount,
          value: pos.value,
          interestEarned: pos.interest_earned,
          interestPaid: pos.interest_paid,
          startDate: new Date(pos.start_date).getTime(),
          isActive: pos.is_active,
        }))
        setPositions(lendingPositions)
      }
    } catch (error) {
      console.error("Error fetching lending positions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your lending positions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchPools()
  }, [])

  useEffect(() => {
    if (publicKey) {
      fetchPositions()
    } else {
      setPositions([])
    }
  }, [publicKey])

  // Supply tokens to a lending pool
  const supplyTokens = async (poolId: string, amount: number): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to supply tokens.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // In a real implementation, this would interact with the blockchain
      // For now, we'll just simulate the supply process

      const pool = pools.find((p) => p.id === poolId)
      if (!pool) {
        throw new Error("Lending pool not found")
      }

      // Calculate value based on token price (would come from actual token price in real implementation)
      const tokenPrice = pool.token === "SOL" ? 150 : pool.token === "SONIC" ? 2.5 : 1
      const value = amount * tokenPrice

      // Create a new lending position
      const newPosition: LendingPosition = {
        id: `lend_${Date.now()}`,
        poolId,
        type: "supply",
        amount,
        value,
        interestEarned: 0,
        startDate: Date.now(),
        isActive: true,
      }

      // Save to Supabase
      const { error } = await supabase.from("lending_positions").insert({
        id: newPosition.id,
        user_id: publicKey.toString(),
        pool_id: newPosition.poolId,
        position_type: newPosition.type,
        amount: newPosition.amount,
        value: newPosition.value,
        interest_earned: newPosition.interestEarned,
        start_date: new Date(newPosition.startDate).toISOString(),
        is_active: true,
      })

      if (error) {
        throw error
      }

      setPositions((prev) => [...prev, newPosition])

      // Refresh balances after supply
      await fetchBalances()

      toast({
        title: "Tokens Supplied",
        description: `Successfully supplied ${amount} ${pool.token} to ${pool.name}.`,
      })

      return true
    } catch (error) {
      console.error("Error supplying tokens:", error)
      toast({
        title: "Supply Failed",
        description: "Failed to supply tokens. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Borrow tokens from a lending pool
  const borrowTokens = async (poolId: string, amount: number): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to borrow tokens.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // In a real implementation, this would interact with the blockchain
      // For now, we'll just simulate the borrow process

      const pool = pools.find((p) => p.id === poolId)
      if (!pool) {
        throw new Error("Lending pool not found")
      }

      // Calculate value based on token price (would come from actual token price in real implementation)
      const tokenPrice = pool.token === "SOL" ? 150 : pool.token === "SONIC" ? 2.5 : 1
      const value = amount * tokenPrice

      // Create a new lending position
      const newPosition: LendingPosition = {
        id: `borrow_${Date.now()}`,
        poolId,
        type: "borrow",
        amount,
        value,
        interestPaid: 0,
        startDate: Date.now(),
        isActive: true,
      }

      // Save to Supabase
      const { error } = await supabase.from("lending_positions").insert({
        id: newPosition.id,
        user_id: publicKey.toString(),
        pool_id: newPosition.poolId,
        position_type: newPosition.type,
        amount: newPosition.amount,
        value: newPosition.value,
        interest_paid: newPosition.interestPaid,
        start_date: new Date(newPosition.startDate).toISOString(),
        is_active: true,
      })

      if (error) {
        throw error
      }

      setPositions((prev) => [...prev, newPosition])

      // Refresh balances after borrow
      await fetchBalances()

      toast({
        title: "Tokens Borrowed",
        description: `Successfully borrowed ${amount} ${pool.token} from ${pool.name}.`,
      })

      return true
    } catch (error) {
      console.error("Error borrowing tokens:", error)
      toast({
        title: "Borrow Failed",
        description: "Failed to borrow tokens. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Repay a loan
  const repayLoan = async (positionId: string, amount: number): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to repay your loan.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // Find the position
      const position = positions.find((p) => p.id === positionId)
      if (!position || position.type !== "borrow") {
        throw new Error("Borrow position not found")
      }

      // In a real implementation, this would interact with the blockchain
      // For now, we'll just simulate the repay process

      // If repaying the full amount, mark as inactive
      const isFullRepayment = amount >= position.amount

      // Update the position
      const updatedPosition = {
        ...position,
        amount: isFullRepayment ? 0 : position.amount - amount,
        isActive: !isFullRepayment,
      }

      // Update in Supabase
      const { error } = await supabase
        .from("lending_positions")
        .update({
          amount: updatedPosition.amount,
          is_active: updatedPosition.isActive,
        })
        .eq("id", positionId)
        .eq("user_id", publicKey.toString())

      if (error) {
        throw error
      }

      setPositions((prev) => prev.map((p) => (p.id === positionId ? updatedPosition : p)))

      // Refresh balances after repay
      await fetchBalances()

      const pool = pools.find((p) => p.id === position.poolId)

      toast({
        title: "Loan Repaid",
        description: isFullRepayment
          ? `Successfully repaid your entire ${pool?.token || "token"} loan.`
          : `Successfully repaid ${amount} ${pool?.token || "tokens"} of your loan.`,
      })

      return true
    } catch (error) {
      console.error("Error repaying loan:", error)
      toast({
        title: "Repayment Failed",
        description: "Failed to repay your loan. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw supplied tokens
  const withdrawSupply = async (positionId: string, amount: number): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to withdraw tokens.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // Find the position
      const position = positions.find((p) => p.id === positionId)
      if (!position || position.type !== "supply") {
        throw new Error("Supply position not found")
      }

      // In a real implementation, this would interact with the blockchain
      // For now, we'll just simulate the withdrawal process

      // If withdrawing the full amount, mark as inactive
      const isFullWithdrawal = amount >= position.amount

      // Update the position
      const updatedPosition = {
        ...position,
        amount: isFullWithdrawal ? 0 : position.amount - amount,
        isActive: !isFullWithdrawal,
      }

      // Update in Supabase
      const { error } = await supabase
        .from("lending_positions")
        .update({
          amount: updatedPosition.amount,
          is_active: updatedPosition.isActive,
        })
        .eq("id", positionId)
        .eq("user_id", publicKey.toString())

      if (error) {
        throw error
      }

      setPositions((prev) => prev.map((p) => (p.id === positionId ? updatedPosition : p)))

      // Refresh balances after withdrawal
      await fetchBalances()

      const pool = pools.find((p) => p.id === position.poolId)

      toast({
        title: "Tokens Withdrawn",
        description: isFullWithdrawal
          ? `Successfully withdrew all your supplied ${pool?.token || "tokens"}.`
          : `Successfully withdrew ${amount} ${pool?.token || "tokens"} from your supply.`,
      })

      return true
    } catch (error) {
      console.error("Error withdrawing tokens:", error)
      toast({
        title: "Withdrawal Failed",
        description: "Failed to withdraw tokens. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get total supplied value
  const getTotalSupplied = (): number => {
    return positions.filter((p) => p.type === "supply" && p.isActive).reduce((total, pos) => total + pos.value, 0)
  }

  // Get total borrowed value
  const getTotalBorrowed = (): number => {
    return positions.filter((p) => p.type === "borrow" && p.isActive).reduce((total, pos) => total + pos.value, 0)
  }

  // Get total interest earned
  const getTotalInterestEarned = (): number => {
    return positions.filter((p) => p.type === "supply").reduce((total, pos) => total + (pos.interestEarned || 0), 0)
  }

  // Get total interest paid
  const getTotalInterestPaid = (): number => {
    return positions.filter((p) => p.type === "borrow").reduce((total, pos) => total + (pos.interestPaid || 0), 0)
  }

  return (
    <LendingContext.Provider
      value={{
        pools,
        positions,
        isLoading,
        fetchPools,
        fetchPositions,
        supplyTokens,
        borrowTokens,
        repayLoan,
        withdrawSupply,
        getTotalSupplied,
        getTotalBorrowed,
        getTotalInterestEarned,
        getTotalInterestPaid,
      }}
    >
      {children}
    </LendingContext.Provider>
  )
}

export function useLendingContext() {
  const context = useContext(LendingContext)
  if (context === undefined) {
    throw new Error("useLendingContext must be used within a LendingProvider")
  }
  return context
}

