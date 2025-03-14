"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getTokenPrices } from "@/services/coingecko"
import { getTokenBalances } from "@/services/solana"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export interface TokenData {
  symbol: string
  name: string
  balance: number
  price: number
  value: number
  change24h: number
  logoUrl: string
  mint?: string
}

interface WalletContextType {
  isLoading: boolean
  tokenBalances: TokenData[]
  totalBalance: number
  fetchBalances: () => Promise<void>
  getBalanceText: () => string
  getTokenBySymbol: (symbol: string) => TokenData | undefined
}

const WalletContext = createContext<WalletContextType>({
  isLoading: false,
  tokenBalances: [],
  totalBalance: 0,
  fetchBalances: async () => {},
  getBalanceText: () => "",
  getTokenBySymbol: () => undefined,
})

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenBalances, setTokenBalances] = useState<TokenData[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const { toast } = useToast()

  // Token definitions
  const TOKENS = {
    SOL: {
      symbol: "SOL",
      name: "Solana",
      coingeckoId: "solana",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      coingeckoId: "usd-coin",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
    SONIC: {
      symbol: "SONIC",
      name: "Sonic",
      mint: "SONIC1111111111111111111111111111111111111",
      coingeckoId: "sonic-token",
      logoUrl: "/placeholder.svg?height=40&width=40",
    },
  }

  const fetchBalances = async () => {
    if (!connected || !publicKey) {
      setTokenBalances([])
      setTotalBalance(0)
      return
    }

    setIsLoading(true)
    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey)
      const solAmount = solBalance / LAMPORTS_PER_SOL

      // Fetch token balances
      const tokenMints = [TOKENS.USDC.mint, TOKENS.SONIC.mint].filter(Boolean) as string[]
      const tokenBalancesResult = await getTokenBalances(connection, publicKey, tokenMints)

      // Fetch token prices
      const coingeckoIds = Object.values(TOKENS).map((token) => token.coingeckoId)
      const prices = await getTokenPrices(coingeckoIds)

      // Create token data
      const solPrice = prices[TOKENS.SOL.coingeckoId]?.current_price || 0
      const solChange = prices[TOKENS.SOL.coingeckoId]?.price_change_percentage_24h || 0
      const usdcPrice = prices[TOKENS.USDC.coingeckoId]?.current_price || 1
      const usdcChange = prices[TOKENS.USDC.coingeckoId]?.price_change_percentage_24h || 0
      const sonicPrice = prices[TOKENS.SONIC.coingeckoId]?.current_price || 2.5
      const sonicChange = prices[TOKENS.SONIC.coingeckoId]?.price_change_percentage_24h || 5.2

      // For demo purposes, we'll use mock balances if real ones aren't available
      const usdcBalance = tokenBalancesResult[TOKENS.USDC.mint!] || 100
      const sonicBalance = tokenBalancesResult[TOKENS.SONIC.mint!] || 500

      const tokens: TokenData[] = [
        {
          ...TOKENS.SOL,
          balance: solAmount,
          price: solPrice,
          value: solAmount * solPrice,
          change24h: solChange,
        },
        {
          ...TOKENS.USDC,
          balance: usdcBalance,
          price: usdcPrice,
          value: usdcBalance * usdcPrice,
          change24h: usdcChange,
        },
        {
          ...TOKENS.SONIC,
          balance: sonicBalance,
          price: sonicPrice,
          value: sonicBalance * sonicPrice,
          change24h: sonicChange,
        },
      ]

      setTokenBalances(tokens)
      const total = tokens.reduce((sum, token) => sum + token.value, 0)
      setTotalBalance(total)

      // Store wallet data in Supabase if user is connected
      if (connected && publicKey) {
        const { error } = await supabase.from("users").upsert(
          {
            wallet_address: publicKey.toString(),
            last_balance: total,
            last_seen: new Date().toISOString(),
          },
          { onConflict: "wallet_address" },
        )

        if (error) {
          console.error("Error storing wallet data:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error)
      toast({
        title: "Error fetching balances",
        description: "Could not retrieve your token balances. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances()
      // Set up interval to refresh balances
      const interval = setInterval(fetchBalances, 60000) // Every minute
      return () => clearInterval(interval)
    }
  }, [connected, publicKey])

  const getBalanceText = () => {
    if (!connected) return "Please connect your wallet to view your balance."
    if (isLoading) return "Fetching your balance..."
    if (tokenBalances.length === 0) return "No tokens found in your wallet."

    let text = `Your total balance is $${totalBalance.toFixed(2)}. `
    text += "Here's a breakdown of your tokens: "

    tokenBalances.forEach((token) => {
      text += `${token.balance.toFixed(4)} ${token.symbol} ($${token.value.toFixed(2)}) at $${token.price.toFixed(2)} per token, `
    })

    return text.slice(0, -2) + "."
  }

  const getTokenBySymbol = (symbol: string) => {
    return tokenBalances.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase())
  }

  return (
    <WalletContext.Provider
      value={{
        isLoading,
        tokenBalances,
        totalBalance,
        fetchBalances,
        getBalanceText,
        getTokenBySymbol,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletContextProvider")
  }
  return context
}

