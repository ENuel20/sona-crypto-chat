"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { v4 as uuidv4 } from "uuid"
import { useWalletContext } from "@/contexts/WalletContext"
import { usePriceAlertContext } from "@/contexts/PriceAlertContext"
import { useStakingContext } from "@/contexts/StakingContext"
import { useSwapContext } from "@/contexts/SwapContext"
import { useLendingContext } from "@/contexts/LendingContext"
import { supabase } from "@/lib/supabase"
import { processMessage } from "@/lib/agent"

export type ChatMode = "general" | "trading" | "staking" | "lending" | "market"

export interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: number
}

export interface Conversation {
  id: string
  name: string
  mode: ChatMode
  messages: Message[]
  lastUpdated: number
}

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  chatMode: ChatMode
  setChatMode: (mode: ChatMode) => void
  createConversation: (mode: ChatMode) => void
  switchConversation: (id: string) => void
  addMessage: (content: string, role: "user" | "assistant" | "system") => void
  updateConversationName: (id: string, name: string) => void
  deleteConversation: (id: string) => void
  isProcessing: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const STORAGE_KEY_PREFIX = "grok3_chat_history_"

export function ChatProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const { getBalanceText, fetchBalances } = useWalletContext()
  const priceAlertContext = usePriceAlertContext()
  const stakingContext = useStakingContext()
  const swapContext = useSwapContext()
  const lendingContext = useLendingContext()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode>("general")
  const [isProcessing, setIsProcessing] = useState(false)

  // Storage key based on wallet
  const storageKey = publicKey ? `${STORAGE_KEY_PREFIX}${publicKey.toString()}` : null

  // Load conversations from localStorage
  useEffect(() => {
    if (!storageKey) {
      setConversations([])
      setCurrentConversation(null)
      setChatMode("general")
      return
    }

    const loadConversations = async () => {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", publicKey?.toString())
        .order("last_updated", { ascending: false })

      if (data && data.length > 0 && !error) {
        // Convert from database format to our format
        const parsedConversations = data.map((conv) => ({
          id: conv.id,
          name: conv.name,
          mode: conv.mode as ChatMode,
          messages: JSON.parse(conv.messages),
          lastUpdated: new Date(conv.last_updated).getTime(),
        }))

        setConversations(parsedConversations)
        setCurrentConversation(parsedConversations[0])
        setChatMode(parsedConversations[0].mode)
        return
      }

      // Fall back to localStorage if Supabase fails
      const storedConversations = localStorage.getItem(storageKey)
      if (storedConversations) {
        try {
          const parsedConversations = JSON.parse(storedConversations) as Conversation[]
          setConversations(parsedConversations)

          if (parsedConversations.length > 0) {
            const mostRecent = parsedConversations.reduce(
              (latest, conv) => (conv.lastUpdated > latest.lastUpdated ? conv : latest),
              parsedConversations[0],
            )
            setCurrentConversation(mostRecent)
            setChatMode(mostRecent.mode)
          } else {
            createNewConversation("general")
          }
        } catch (error) {
          console.error("Failed to parse stored conversations:", error)
          createNewConversation("general")
        }
      } else {
        createNewConversation("general")
      }
    }

    loadConversations()
  }, [storageKey])

  // Helper function to create a new conversation without using the main createConversation function
  const createNewConversation = (mode: ChatMode) => {
    const newConversation: Conversation = {
      id: uuidv4(),
      name: "New Chat",
      mode,
      messages: [],
      lastUpdated: Date.now(),
    }
    setConversations([newConversation])
    setCurrentConversation(newConversation)
    setChatMode(mode)
  }

  // Save conversations to storage
  useEffect(() => {
    const saveConversations = async () => {
      if (!storageKey || conversations.length === 0) return

      // Save to localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(conversations))

      // Save to Supabase if user is connected
      if (publicKey && currentConversation) {
        const { error } = await supabase.from("conversations").upsert(
          {
            id: currentConversation.id,
            user_id: publicKey.toString(),
            name: currentConversation.name,
            mode: currentConversation.mode,
            messages: JSON.stringify(currentConversation.messages),
            last_updated: new Date(currentConversation.lastUpdated).toISOString(),
          },
          { onConflict: "id" },
        )

        if (error) {
          console.error("Error saving conversation to Supabase:", error)
        }
      }
    }

    saveConversations()
  }, [conversations, currentConversation, storageKey, publicKey])

  const createConversation = useCallback((mode: ChatMode) => {
    const newConversation: Conversation = {
      id: uuidv4(),
      name: "New Chat",
      mode,
      messages: [],
      lastUpdated: Date.now(),
    }

    setConversations((prev) => [...prev, newConversation])
    setCurrentConversation(newConversation)
    setChatMode(mode)
  }, [])

  const switchConversation = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id)
      if (conversation) {
        setCurrentConversation(conversation)
        setChatMode(conversation.mode)
      }
    },
    [conversations],
  )

  const addMessage = useCallback(
    async (content: string, role: "user" | "assistant" | "system") => {
      if (!currentConversation) return

      const newMessage: Message = {
        id: uuidv4(),
        content,
        role,
        timestamp: Date.now(),
      }

      const updatedConversation: Conversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, newMessage],
        lastUpdated: Date.now(),
      }

      // Generate name from first user message if it's the first message
      if (currentConversation.messages.length === 0 && role === "user") {
        updatedConversation.name = generateConversationName(content)
      }

      setConversations((prev) => prev.map((c) => (c.id === currentConversation.id ? updatedConversation : c)))
      setCurrentConversation(updatedConversation)

      // If this is a user message, process it with the agent
      if (role === "user") {
        setIsProcessing(true)
        try {
          // Process the message with our agent
          const response = await processMessage(content, {
            walletContext: {
              getBalanceText,
              fetchBalances,
            },
            priceAlertContext,
            stakingContext,
            swapContext,
            lendingContext,
            conversation: updatedConversation,
          })

          // Add the assistant's response
          const assistantMessage: Message = {
            id: uuidv4(),
            content: response,
            role: "assistant",
            timestamp: Date.now(),
          }

          const finalConversation: Conversation = {
            ...updatedConversation,
            messages: [...updatedConversation.messages, assistantMessage],
            lastUpdated: Date.now(),
          }

          setConversations((prev) => prev.map((c) => (c.id === currentConversation.id ? finalConversation : c)))
          setCurrentConversation(finalConversation)
        } catch (error) {
          console.error("Error processing message:", error)

          // Add an error message
          const errorMessage: Message = {
            id: uuidv4(),
            content: "I'm sorry, I encountered an error processing your request. Please try again.",
            role: "assistant",
            timestamp: Date.now(),
          }

          const errorConversation: Conversation = {
            ...updatedConversation,
            messages: [...updatedConversation.messages, errorMessage],
            lastUpdated: Date.now(),
          }

          setConversations((prev) => prev.map((c) => (c.id === currentConversation.id ? errorConversation : c)))
          setCurrentConversation(errorConversation)
        } finally {
          setIsProcessing(false)
        }
      }
    },
    [
      currentConversation,
      getBalanceText,
      fetchBalances,
      priceAlertContext,
      stakingContext,
      swapContext,
      lendingContext,
    ],
  )

  const updateConversationName = useCallback(
    (id: string, name: string) => {
      if (!name.trim()) return

      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)))

      if (currentConversation?.id === id) {
        setCurrentConversation((prev) => (prev ? { ...prev, name: name.trim() } : null))
      }
    },
    [currentConversation],
  )

  const deleteConversation = useCallback(
    async (id: string) => {
      // Delete from Supabase if user is connected
      if (publicKey) {
        const { error } = await supabase.from("conversations").delete().eq("id", id).eq("user_id", publicKey.toString())

        if (error) {
          console.error("Error deleting conversation from Supabase:", error)
        }
      }

      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        if (currentConversation?.id === id) {
          const nextConversation = filtered[0] || null
          setCurrentConversation(nextConversation)
          if (nextConversation) {
            setChatMode(nextConversation.mode)
          }
        }
        return filtered
      })
    },
    [currentConversation, publicKey],
  )

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        chatMode,
        setChatMode,
        createConversation,
        switchConversation,
        addMessage,
        updateConversationName,
        deleteConversation,
        isProcessing,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}

// Helper function to generate conversation names
function generateConversationName(content: string): string {
  try {
    // Remove any special characters and extra spaces
    const cleanContent = content
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Split into words and take first 6 words
    const words = cleanContent.split(" ")
    const nameWords = words.slice(0, 6)
    let name = nameWords.join(" ")

    // Add ellipsis if there are more words
    if (words.length > 6) {
      name += "..."
    }

    // Limit total length
    return name.length > 50 ? name.substring(0, 47) + "..." : name
  } catch (error) {
    console.error("Error generating conversation name:", error)
    return "New Chat"
  }
}

