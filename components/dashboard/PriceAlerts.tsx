"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PriceAlert {
  asset: string
  price: number
  condition: "above" | "below"
}

export function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    { asset: "ETH", price: 2000, condition: "above" },
    { asset: "BTC", price: 35000, condition: "below" },
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Price Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{alert.asset}</h4>
                  <p className="text-sm text-muted-foreground">
                    Alert when price is {alert.condition} ${alert.price.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlerts(alerts.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Create New Alert</h4>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="asset">Asset</Label>
                <Input id="asset" placeholder="Select asset (e.g. BTC, ETH)" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price Target ($)</Label>
                <Input id="price" type="number" placeholder="Enter price" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
              <Button>Create Alert</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
