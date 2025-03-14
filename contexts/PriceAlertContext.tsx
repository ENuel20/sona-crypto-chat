"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletContext } from "@/contexts/WalletContext"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

export interface PriceAlert {
  id: string
  token: string
  price: number
  condition: "above" | "below"
  active: boolean
  createdAt: number
}

interface PriceAlertContextType {
  alerts: PriceAlert[]
  addAlert: (token: string, price: number, condition: "above" | "below") => Promise<void>
  removeAlert: (id: string) => Promise<void>
  toggleAlert: (id: string) => Promise<void>
  checkAlerts: () => Promise<string[]>
}

const PriceAlertContext = createContext<PriceAlertContextType>({
  alerts: [],
  addAlert: async () => {},
  removeAlert: async () => {},
  toggleAlert: async () => {},
  checkAlerts: async () => [],
})

export function PriceAlertProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const { tokenBalances } = useWalletContext()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const { toast } = useToast()

  // Load alerts from Supabase
  useEffect(() => {
    if (!publicKey) {
      setAlerts([])
      return
    }

    const loadAlerts = async () => {
      const { data, error } = await supabase.from("price_alerts").select("*").eq("user_id", publicKey.toString())

      if (error) {
        console.error("Error loading price alerts:", error)
        return
      }

      if (data) {
        const formattedAlerts: PriceAlert[] = data.map((alert) => ({
          id: alert.id,
          token: alert.token,
          price: alert.price_threshold,
          condition: alert.condition as "above" | "below",
          active: alert.active,
          createdAt: new Date(alert.created_at).getTime(),
        }))
        setAlerts(formattedAlerts)
      }
    }

    loadAlerts()
  }, [publicKey])

  // Add a new price alert
  const addAlert = async (token: string, price: number, condition: "above" | "below") => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to set price alerts.",
        variant: "destructive",
      })
      return
    }

    const newAlert: PriceAlert = {
      id: uuidv4(),
      token,
      price,
      condition,
      active: true,
      createdAt: Date.now(),
    }

    // Save to Supabase
    const { error } = await supabase.from("price_alerts").insert({
      id: newAlert.id,
      user_id: publicKey.toString(),
      token: newAlert.token,
      price_threshold: newAlert.price,
      condition: newAlert.condition,
      active: newAlert.active,
      created_at: new Date(newAlert.createdAt).toISOString(),
    })

    if (error) {
      console.error("Error adding price alert:", error)
      toast({
        title: "Error",
        description: "Failed to add price alert. Please try again.",
        variant: "destructive",
      })
      return
    }

    setAlerts((prev) => [...prev, newAlert])
    toast({
      title: "Price Alert Added",
      description: `You'll be notified when ${token} goes ${condition} $${price}.`,
    })
  }

  // Remove a price alert
  const removeAlert = async (id: string) => {
    if (!publicKey) return

    // Delete from Supabase
    const { error } = await supabase.from("price_alerts").delete().eq("id", id).eq("user_id", publicKey.toString())

    if (error) {
      console.error("Error removing price alert:", error)
      toast({
        title: "Error",
        description: "Failed to remove price alert. Please try again.",
        variant: "destructive",
      })
      return
    }

    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    toast({
      title: "Price Alert Removed",
      description: "Your price alert has been removed.",
    })
  }

  // Toggle a price alert
  const toggleAlert = async (id: string) => {
    if (!publicKey) return

    const alert = alerts.find((a) => a.id === id)
    if (!alert) return

    const updatedAlert = { ...alert, active: !alert.active }

    // Update in Supabase
    const { error } = await supabase
      .from("price_alerts")
      .update({ active: updatedAlert.active })
      .eq("id", id)
      .eq("user_id", publicKey.toString())

    if (error) {
      console.error("Error toggling price alert:", error)
      toast({
        title: "Error",
        description: "Failed to update price alert. Please try again.",
        variant: "destructive",
      })
      return
    }

    setAlerts((prev) => prev.map((a) => (a.id === id ? updatedAlert : a)))
    toast({
      title: `Price Alert ${updatedAlert.active ? "Activated" : "Deactivated"}`,
      description: `Your price alert for ${alert.token} has been ${updatedAlert.active ? "activated" : "deactivated"}.`,
    })
  }

  // Check if any alerts have been triggered
  const checkAlerts = async (): Promise<string[]> => {
    const triggeredAlerts: string[] = []

    // Only check active alerts
    const activeAlerts = alerts.filter((alert) => alert.active)
    if (activeAlerts.length === 0) return triggeredAlerts

    // Check each alert against current token prices
    activeAlerts.forEach((alert) => {
      const token = tokenBalances.find((t) => t.symbol.toLowerCase() === alert.token.toLowerCase())
      if (!token) return

      const isTriggered =
        (alert.condition === "above" && token.price >= alert.price) ||
        (alert.condition === "below" && token.price <= alert.price)

      if (isTriggered) {
        triggeredAlerts.push(
          `${token.symbol} is now ${alert.condition === "above" ? "above" : "below"} $${alert.price} (current price: $${token.price.toFixed(2)})`,
        )
      }
    })

    return triggeredAlerts
  }

  return (
    <PriceAlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        toggleAlert,
        checkAlerts,
      }}
    >
      {children}
    </PriceAlertContext.Provider>
  )
}

export function usePriceAlertContext() {
  const context = useContext(PriceAlertContext)
  if (context === undefined) {
    throw new Error("usePriceAlertContext must be used within a PriceAlertProvider")
  }
  return context
}

