"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LendingPosition {
  asset: string
  amount: number
  apy: number
}

interface BorrowingPosition {
  asset: string
  amount: number
  apr: number
  collateral: string
}

export function LendingDashboard() {
  const [lendingTab, setLendingTab] = useState("lend")
  
  // Example lending positions - in a real app, these would come from your backend
  const lendingPositions: LendingPosition[] = [
    { asset: "ETH", amount: 2.5, apy: 3.2 },
    { asset: "USDC", amount: 5000, apy: 4.5 },
  ]

  const borrowingPositions: BorrowingPosition[] = [
    { asset: "ETH", amount: 1.2, apr: 5.5, collateral: "USDC" },
    { asset: "USDC", amount: 2000, apr: 6.2, collateral: "ETH" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,500.00</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,200.00</div>
            <p className="text-xs text-muted-foreground">+10.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8%</div>
            <p className="text-xs text-muted-foreground">Average return rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1.8</div>
            <p className="text-xs text-muted-foreground">Safe position</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={lendingTab} onValueChange={setLendingTab}>
        <TabsList>
          <TabsTrigger value="lend">Lend</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Lending Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lendingPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{position.asset}</h4>
                      <p className="text-sm text-muted-foreground">
                        Amount: {position.amount} {position.asset}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600">{position.apy}% APY</p>
                      <Button variant="outline" size="sm">Withdraw</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Lend Assets</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="asset">Asset</Label>
                    <Input id="asset" placeholder="Select asset" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="Enter amount" />
                  </div>
                  <Button>Supply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Borrowing Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {borrowingPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{position.asset}</h4>
                      <p className="text-sm text-muted-foreground">
                        Amount: {position.amount} {position.asset}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Collateral: {position.collateral}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600">{position.apr}% APR</p>
                      <Button variant="outline" size="sm">Repay</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Borrow Assets</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="borrowAsset">Asset to Borrow</Label>
                    <Input id="borrowAsset" placeholder="Select asset" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="borrowAmount">Amount</Label>
                    <Input id="borrowAmount" type="number" placeholder="Enter amount" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="collateral">Collateral</Label>
                    <Input id="collateral" placeholder="Select collateral asset" />
                  </div>
                  <Button>Borrow</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
