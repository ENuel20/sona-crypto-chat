"use client"

import { useState } from "react"
import { useWalletContext } from "@/contexts/WalletContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"

export function TokenList() {
  const { connected } = useWallet()
  const { tokenBalances, isLoading } = useWalletContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({ key: "value", direction: "descending" })

  // Filter tokens based on search query
  const filteredTokens = tokenBalances.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort tokens based on sort config
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
      return sortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Request sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: string) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? "↑" : "↓"
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to view your token balances</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Token Balances</CardTitle>
            <CardDescription>View and manage your tokens</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("balance")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Balance
                      <ArrowUpDown className="h-3 w-3" />
                      {getSortDirectionIndicator("balance")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("price")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                      {getSortDirectionIndicator("price")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("value")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Value
                      <ArrowUpDown className="h-3 w-3" />
                      {getSortDirectionIndicator("value")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("change24h")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      24h Change
                      <ArrowUpDown className="h-3 w-3" />
                      {getSortDirectionIndicator("change24h")}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchQuery ? "No tokens found matching your search" : "No tokens found in your wallet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTokens.map((token) => (
                    <TableRow key={token.symbol}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div>{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{token.balance.toFixed(4)}</TableCell>
                      <TableCell>${token.price.toFixed(2)}</TableCell>
                      <TableCell>${token.value.toFixed(2)}</TableCell>
                      <TableCell className={token.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                        {token.change24h >= 0 ? "+" : ""}
                        {token.change24h.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

