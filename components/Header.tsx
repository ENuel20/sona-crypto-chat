"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWalletContext } from "@/contexts/WalletContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, Settings, HelpCircle, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { connected, publicKey, disconnect } = useWallet()
  const { totalBalance } = useWalletContext()
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-bold text-xl flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Grok 3</span>
            <Badge variant="outline" className="ml-2 text-xs">
              by xAI
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {connected && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">${totalBalance.toFixed(2)}</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!connected ? (
            <WalletMultiButton className="wallet-adapter-button-custom" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="hidden sm:inline-block">
                    {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <HelpCircle className="h-4 w-4" /> Help
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={disconnect}>
                  <LogOut className="h-4 w-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

