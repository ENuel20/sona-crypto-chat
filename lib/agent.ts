import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Conversation } from "@/contexts/ChatContext"

interface AgentContext {
  walletContext: {
    getBalanceText: () => string
    fetchBalances: () => Promise<void>
  }
  priceAlertContext: any
  stakingContext: any
  swapContext: any
  lendingContext: any
  conversation: Conversation
}

export async function processMessage(message: string, context: AgentContext): Promise<string> {
  try {
    // First, check if we need to fetch fresh balances
    if (
      message.toLowerCase().includes("balance") ||
      message.toLowerCase().includes("portfolio") ||
      message.toLowerCase().includes("wallet") ||
      message.toLowerCase().includes("tokens") ||
      message.toLowerCase().includes("holdings") ||
      message.toLowerCase().includes("sonic") ||
      message.toLowerCase().includes("sol") ||
      message.toLowerCase().includes("usdc")
    ) {
      await context.walletContext.fetchBalances()
    }

    // Prepare conversation history for the AI
    const conversationHistory = context.conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Create a system message with current date and capabilities
    const systemMessage = `
      You are Grok 3, an advanced cryptocurrency AI assistant built by xAI.
      Current date: March 14, 2025
      
      You have the following capabilities:
      1. Check wallet balances for SOL, USDC, and SONIC tokens
      2. Set price alerts for tokens
      3. Recommend staking pools
      4. Swap tokens
      5. Lend and borrow tokens
      6. Explain cryptocurrency concepts
      
      When asked about balances or portfolio information, use the most recent data.
      When explaining concepts, be clear, concise, and accurate.
      When making recommendations, explain your reasoning.
      
      Focus on Solana (SOL), USDC, and Sonic ($SONIC) tokens.
      
      $SONIC is the native token of Sonic SVM, a Solana Layer 2 designed for gaming and applications, 
      launched on January 7, 2025, with a total supply of 2,400,000,000 tokens.
    `

    // Use the AI SDK to generate a response
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemMessage,
      messages: [...conversationHistory, { role: "user", content: message }],
      temperature: 0.7,
      maxTokens: 1000,
    })

    // For balance queries, append the actual balance data
    if (
      message.toLowerCase().includes("balance") ||
      message.toLowerCase().includes("portfolio") ||
      message.toLowerCase().includes("wallet") ||
      message.toLowerCase().includes("holdings")
    ) {
      const balanceText = context.walletContext.getBalanceText()
      return `${text}\n\n${balanceText}`
    }

    return text
  } catch (error) {
    console.error("Error in agent processing:", error)
    return "I'm sorry, I encountered an error processing your request. Please try again."
  }
}

