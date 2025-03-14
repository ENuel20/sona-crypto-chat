"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Home,
  BarChart3,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  BellRing,
  HelpCircle,
  Settings,
  DollarSign,
} from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletContext } from "@/contexts/WalletContext"

export function AppSidebar() {
  const { connected } = useWallet()
  const { totalBalance } = useWalletContext()

  return (
    <Sidebar>
      <SidebarHeader>
        {connected && (
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Total Balance</div>
            <div className="text-lg font-semibold">${totalBalance.toFixed(2)}</div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#dashboard">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#wallet">
                <Wallet className="h-4 w-4" />
                <span>Wallet</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#swap">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Swap</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#stake">
                <PiggyBank className="h-4 w-4" />
                <span>Stake</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#lend">
                <DollarSign className="h-4 w-4" />
                <span>Lend & Borrow</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#alerts">
                <BellRing className="h-4 w-4" />
                <span>Price Alerts</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#help">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/#settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

