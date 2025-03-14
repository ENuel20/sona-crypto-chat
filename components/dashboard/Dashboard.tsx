"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioOverview } from "./PortfolioOverview"
import { TokenList } from "./TokenList"
import { StakingDashboard } from "./StakingDashboard"
import { SwapInterface } from "./SwapInterface"
import { LendingDashboard } from "./LendingDashboard"
import { PriceAlerts } from "./PriceAlerts"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="lend">Lend & Borrow</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <PortfolioOverview />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <TokenList />
        </TabsContent>

        <TabsContent value="stake" className="space-y-4">
          <StakingDashboard />
        </TabsContent>

        <TabsContent value="swap" className="space-y-4">
          <SwapInterface />
        </TabsContent>

        <TabsContent value="lend" className="space-y-4">
          <LendingDashboard />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <PriceAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}

