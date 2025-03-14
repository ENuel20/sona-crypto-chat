"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { getStakingPools } from "@/services/staking"

export interface StakingPool {
  id: string
  name: string
  token: string
  apy: number
  tvl: number
  minStake: number
  lockupPeriod: number // in days
  isLiquid: boolean
  provider: string
  description: string
  logoUrl: string
}

export interface StakedPosition {
  id: string
  poolId: string
  amount: number
  value: number
  rewards: number
  startDate: number
  endDate: number | null
  isActive: boolean
}

interface StakingContextType {
  pools: StakingPool[]
  stakedPositions: StakedPosition[]
  isLoading: boolean
  fetchPools: () => Promise<void>
  fetchStakedPositions: () => Promise<void>
  stakeTokens: (poolId: string, amount: number) => Promise<boolean>
  unstakeTokens: (positionId: string) => Promise<boolean>
  getRecommendedPools: (token: string, amount: number) => StakingPool[]
  getTotalStakedValue: () => number
  getTotalRewards: () => number
}

const StakingContext = createContext<StakingContextType>({
  pools: [],
  stakedPositions: [],
  isLoading: false,
  fetchPools: async () => {},
  fetchStakedPositions: async () => {},
  stakeTokens: async () => false,
  unstakeTokens: async () => false,
  getRecommendedPools: () => [],
  getTotalStakedValue: () => 0,
  getTotalRewards: () => 0,
})

export function StakingProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [pools, setPools] = useState<StakingPool[]>([])
  const [stakedPositions, setStakedPositions] = useState<StakedPosition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch staking pools
  const fetchPools = async () => {
    setIsLoading(true)
    try {
      const fetchedPools = await getStakingPools()
      setPools(fetchedPools)
    } catch (error) {
      console.error("Error fetching staking pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch staking pools. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's staked positions
  const fetchStakedPositions = async () => {
    if (!publicKey) {
      setStakedPositions([])
      return
    }

    setIsLoading(true)
    try {
      // Fetch from Supabase
      const { data, error } = await supabase.from("staking_positions").select("*").eq("user_id", publicKey.toString())

      if (error) {
        throw error
      }

      if (data) {
        const positions: StakedPosition[] = data.map((pos) => ({
          id: pos.id,
          poolId: pos.pool_id,
          amount: pos.amount,
          value: pos.value,
          rewards: pos.rewards,
          startDate: new Date(pos.start_date).getTime(),
          endDate: pos.end_date ? new Date(pos.end_date).getTime() : null,
          isActive: pos.is_active,
        }))
        setStakedPositions(positions)
      }
    } catch (error) {
      console.error("Error fetching staked positions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your staked positions. Please try again.",
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
      fetchStakedPositions()
    } else {
      setStakedPositions([])
    }
  }, [publicKey])

  // Stake tokens
  const stakeTokens = async (poolId: string, amount: number): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake tokens.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // In a real implementation, this would interact with the blockchain
      // For now, we'll just simulate the staking process

      const pool = pools.find((p) => p.id === poolId)
      if (!pool) {
        throw new Error("Staking pool not found")
      }

      // Calculate value based on token price (would come from actual token price in real implementation)
      const tokenPrice = pool.token === "SOL" ? 150 : pool.token === "SONIC" ? 2.5 : 1
      const value = amount * tokenPrice

      // Create a new staked position
      const newPosition: StakedPosition = {
        id: `pos_${Date.now()}`,
        poolId,
        amount,
        value,
        rewards: 0,
        startDate: Date.now(),
        endDate: null,
        isActive: true,
      }

      // Save to Supabase
      const { error } = await supabase.from("staking_positions").insert({
        id: newPosition.id,
        user_id: publicKey.toString(),
        pool_id: newPosition.poolId,
        amount: newPosition.amount,
        value: newPosition.value,
        rewards: newPosition.rewards,
        start_date: new Date(newPosition.startDate).toISOString(),
        end_date: null,
        is_active: true,
      })

      if (error) {
        throw error
      }

      setStakedPositions((prev) => [...prev, newPosition])

      toast({
        title: "Tokens Staked",
        description: `Successfully staked ${amount} ${pool.token} in ${pool.name}.`,
      })

      return true
    } catch (error) {
      console.error("Error staking tokens:", error)
      toast({
        title: "Staking Failed",
        description: "Failed to stake tokens. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Unstake tokens
  const unstakeTokens = async (positionId: string): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unstake tokens.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      // Find the position
      const position = stakedPositions.find((p) => p.id === positionId)
      if (!position) {
        throw new Error("Staked position not found")
      }

      // In a real implementation, this would interact with the blockchain
      // For now, we'll just simulate the unstaking process

      // Update the position
      const updatedPosition = {
        ...position,
        isActive: false,
        endDate: Date.now(),
      }

      // Update in Supabase
      const { error } = await supabase
        .from("staking_positions")
        .update({
          is_active: false,
          end_date: new Date(updatedPosition.endDate!).toISOString(),
        })
        .eq("id", positionId)
        .eq("user_id", publicKey.toString())

      if (error) {
        throw error
      }

      setStakedPositions((prev) => prev.map((p) => (p.id === positionId ? updatedPosition : p)))

      const pool = pools.find((p) => p.id === position.poolId)

      toast({
        title: "Tokens Unstaked",
        description: `Successfully unstaked ${position.amount} ${pool?.token || "tokens"}.`,
      })

      return true
    } catch (error) {
      console.error("Error unstaking tokens:", error)
      toast({
        title: "Unstaking Failed",
        description: "Failed to unstake tokens. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get recommended staking pools for a token
  const getRecommendedPools = (token: string, amount: number): StakingPool[] => {
    // Filter pools by token
    const tokenPools = pools.filter((p) => p.token.toLowerCase() === token.toLowerCase())

    // Sort by APY (highest first)
    return tokenPools.sort((a, b) => b.apy - a.apy)
  }

  // Get total staked value
  const getTotalStakedValue = (): number => {
    return stakedPositions.filter((p) => p.isActive).reduce((total, pos) => total + pos.value, 0)
  }

  // Get total rewards
  const getTotalRewards = (): number => {
    return stakedPositions.filter((p) => p.isActive).reduce((total, pos) => total + pos.rewards, 0)
  }

  return (
    <StakingContext.Provider
      value={{
        pools,
        stakedPositions,
        isLoading,
        fetchPools,
        fetchStakedPositions,
        stakeTokens,
        unstakeTokens,
        getRecommendedPools,
        getTotalStakedValue,
        getTotalRewards,
      }}
    >
      {children}
    </StakingContext.Provider>
  )
}

export function useStakingContext() {
  const context = useContext(StakingContext)
  if (context === undefined) {
    throw new Error("useStakingContext must be used within a StakingProvider")
  }
  return context
}

