"use client"

import { useEffect, useRef, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { type Message, useChatContext } from "@/contexts/ChatContext"
import { ChatInput } from "./ChatInput"
import { ChatSidebar } from "./ChatSidebar"
import { Mic, Image, Info, Wallet, ArrowLeftRight, Menu, PiggyBank, DollarSign } from "lucide-react"
import { useWalletContext } from "@/contexts/WalletContext"
import { usePriceAlertContext } from "@/contexts/PriceAlertContext"
import { Button } from "@/components/ui/button"

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-muted rounded-lg w-fit">
      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
      <span
        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      />
      <span
        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  )
}

export function Chat() {
  const { connected } = useWallet()
  const { currentConversation, addMessage, chatMode, createConversation, isProcessing } = useChatContext()
  const { fetchBalances } = useWalletContext()
  const { checkAlerts } = usePriceAlertContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check for triggered price alerts
  useEffect(() => {
    const checkForAlerts = async () => {
      if (connected) {
        const triggeredAlerts = await checkAlerts()
        if (triggeredAlerts.length > 0) {
          // Notify the user about triggered alerts
          triggeredAlerts.forEach((alert) => {
            addMessage(`🔔 Price Alert: ${alert}`, "system")
          })
        }
      }
    }

    // Check on mount and every 5 minutes
    checkForAlerts()
    const interval = setInterval(checkForAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [connected, checkAlerts, addMessage])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (currentConversation?.messages.length && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentConversation?.messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation) return
    await addMessage(content, "user")
  }

  const getModeDescription = () => {
    switch (chatMode) {
      case "general":
        return "Ask me anything about crypto, blockchain, or general questions."
      case "trading":
        return "I can help you with trading strategies, market analysis, and token swaps."
      case "staking":
        return "Let's explore staking options, validator selection, and optimize your staking rewards."
      case "lending":
        return "I can assist with lending and borrowing strategies, interest rates, and risk management."
      case "market":
        return "Ask me about market trends, price predictions, and latest crypto news."
    }
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user"
    const isSystem = message.role === "system"

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
      >
        <div
          className={`max-w-[80%] rounded-lg ${
            isUser
              ? "bg-primary text-primary-foreground"
              : isSystem
                ? "bg-muted/80 text-muted-foreground border border-border"
                : "bg-muted text-muted-foreground"
          }`}
        >
          <div className="p-3 whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed md:hidden inset-y-0 left-0 z-40
          w-[280px] h-screen
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-background border-r border-border
        `}
      >
        <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-14 flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="h-full px-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-1 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold capitalize">{chatMode} Mode</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip("mode")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showTooltip === "mode" && (
                    <div className="absolute left-0 top-6 w-64 p-2 bg-popover rounded-lg text-sm shadow-lg z-50 border border-border">
                      {getModeDescription()}
                    </div>
                  )}
                </div>
              </div>
              {!connected && (
                <div className="text-sm text-yellow-500 ml-auto hidden sm:block">
                  Connect your wallet to access all features
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-36">
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
                <div className="text-center p-8 rounded-xl bg-muted/50 backdrop-blur-sm border border-border max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Welcome to Grok 3
                  </h2>
                  <p className="text-muted-foreground mb-8">{getModeDescription()}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold">Swap Tokens</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Swap between different tokens instantly</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold">Stake Tokens</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Stake your tokens to earn rewards</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-green-400" />
                        <h3 className="font-semibold">Check Balance</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">View your token balances and portfolio</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold">Lend & Borrow</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Access DeFi lending protocols</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentConversation.messages.map(renderMessage)}
                {isProcessing && (
                  <div className="flex justify-start">
                    <LoadingDots />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Container - Fixed at bottom */}
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 z-10">
          <div className="max-w-4xl mx-auto w-full px-4 pb-4">
            <ChatInput onSubmit={handleSendMessage} isLoading={isProcessing} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors px-2 py-1 rounded-md">
                    <Mic className="w-3 h-3" /> Voice
                  </button>
                  <button className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors px-2 py-1 rounded-md">
                    <Image className="w-3 h-3" /> Image
                  </button>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleSendMessage("What's my balance?")}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Wallet className="w-4 h-4" /> Check Balance
                  </Button>
                </div>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Press Enter to send, Shift + Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

