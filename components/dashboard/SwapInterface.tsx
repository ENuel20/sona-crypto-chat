"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useSwapContext } from "@/contexts/SwapContext"
import { useWalletContext } from "@/contexts/WalletContext"

export function SwapInterface() {
  const { connected } = useWallet()
  const { getSwapQuotes, executeSwap, swapHistory, fetchSwapHistory, isLoading } = useSwapContext()
  const { tokenBalances, getTokenBySymbol } = useWalletContext()
  
  const [fromToken, setFromToken] = useState<string>("SOL")
  const [toToken, setToToken] = useState<string>("USDC")
  const [amount, setAmount] = useState<string>("")
  const [quotes, setQuotes] = useState<any[]>([])
  const [selectedQuote, setSelectedQuote] = useState<string>("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  
  // Fetch swap history on mount
  useEffect(() => {
    if (connected) {
      fetchSwapHistory()
    }
  }, [connected, fetchSwapHistory])
  
  // Get token balance
  const getTokenBalance = (symbol: string) => {
    const token = getTokenBySymbol(symbol)
    return token ? token.balance : 0
  }
  
  // Handle token swap
  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setQuotes([])
    setSelectedQuote("")
  }
  
  // Fetch quotes
  const handleFetchQuotes = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return
    
    setIsLoadingQuotes(true)
    try {
      const fetchedQuotes = await getSwapQuotes(fromToken, toToken, Number.parseFloat(amount))
      setQuotes(fetchedQuotes)
      if (fetchedQuotes.length > 0) {
        setSelectedQuote(fetchedQuotes[0].id)
      }
    } finally {
      setIsLoadingQuotes(false)
    }
  }
  
  // Execute swap
  const handleExecuteSwap = async () => {
    if (!selectedQuote) return
    
    const quote = quotes.find(q => q.id === selectedQuote)
    if (!quote) return
    
    setIsSwapping(true)
    try {
      const success = await executeSwap(quote)
      if (success) {
        setAmount("")
        setQuotes([])
        setSelectedQuote("")
        fetchSwapHistory()
      }
    } finally {
      setIsSwapping(false)
    }
  }
  
  if (!connected) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to swap tokens
          </p>
        </div>
      </div>
    )
  }

