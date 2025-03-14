"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useStakingContext } from "@/contexts/StakingContext"
import { useWalletContext } from "@/contexts/WalletContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StakingDashboard() {
  const { connected } = useWallet()
  const {
    pools,
    stakedPositions,
    isLoading,
    fetchPools,
    fetchStakedPositions,
    stakeTokens,
    unstakeTokens,
    getTotalStakedValue,
    getTotalRewards,
  } = useStakingContext()
  const { tokenBalances, getTokenBySymbol } = useWalletContext()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedToken, setSelectedToken] = useState<string>("SOL")
  const [selectedPool, setSelectedPool] = useState<string>("")
  const [stakeAmount, setStakeAmount] = useState<string>("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  // Fetch pools and positions on mount
  useEffect(() => {
    fetchPools()
    if (connected) {
      fetchStakedPositions()
    }
  }, [connected, fetchPools, fetchStakedPositions])

  // Filter pools by selected token
  const filteredPools = pools.filter((pool) => pool.token === selectedToken)

  // Get active staked positions
  const activePositions = stakedPositions.filter((pos) => pos.isActive)

  // Handle stake submission
  const handleStake = async () => {
    if (!selectedPool || !stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    setIsStaking(true)
    try {
      const success = await stakeTokens(selectedPool, Number.parseFloat(stakeAmount))
      if (success) {
        setStakeAmount("")
      }
    } finally {
      setIsStaking(false)
    }
  }

  // Handle unstake
  const handleUnstake = async (positionId: string) => {
    setIsUnstaking(true)
    try {
      await unstakeTokens(positionId)
    } finally {
      setIsUnstaking(false)
    }
  }

  // Get token balance
  const getTokenBalance = (symbol: string) => {
    const token = getTokenBySymbol(symbol)
    return token ? token.balance : 0
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to view and manage your staking positions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Staked Value</CardDescription>
                <CardTitle className="text-2xl">${getTotalStakedValue().toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Across {activePositions.length} active positions</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Rewards Earned</CardDescription>
                <CardTitle className="text-2xl">${getTotalRewards().toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">From all staking activities</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Available Pools</CardDescription>
                <CardTitle className="text-2xl">{pools.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Across multiple providers</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Staking Pools</CardTitle>
              <CardDescription>Highest APY pools for your tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pools
                  .sort((a, b) => b.apy - a.apy)
                  .slice(0, 3)
                  .map((pool) => (
                    <Card key={pool.id} className="border border-border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{pool.name}</CardTitle>
                            <CardDescription>{pool.provider}</CardDescription>
                          </div>
                          <Badge variant={pool.isLiquid ? "outline" : "secondary"}>
                            {pool.isLiquid ? "Liquid" : "Native"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">APY</div>
                          <div className="text-lg font-semibold text-green-500">{pool.apy}%</div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground">Token</div>
                          <div>{pool.token}</div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground">Min Stake</div>
                          <div>
                            {pool.minStake} {pool.token}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => {
                            setActiveTab("stake")
                            setSelectedToken(pool.token)
                            setSelectedPool(pool.id)
                          }}
                        >
                          Stake Now
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stake Tab */}
        <TabsContent value="stake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stake Your Tokens</CardTitle>
              <CardDescription>Earn rewards by staking your tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenBalances.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol} ({token.balance.toFixed(4)} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pool">Select Staking Pool</Label>
                <Select value={selectedPool} onValueChange={setSelectedPool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a staking pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name} ({pool.apy}% APY)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount">Amount to Stake</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {getTokenBalance(selectedToken).toFixed(4)} {selectedToken}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount(getTokenBalance(selectedToken).toString())}
                  >
                    Max
                  </Button>
                </div>
              </div>

              {selectedPool && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Pool Information</h4>
                  </div>

                  {pools.find((p) => p.id === selectedPool)?.description && (
                    <p className="text-sm text-muted-foreground">
                      {pools.find((p) => p.id === selectedPool)?.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">APY:</span>{" "}
                      <span className="text-green-500 font-medium">
                        {pools.find((p) => p.id === selectedPool)?.apy}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lockup Period:</span>{" "}
                      <span>{pools.find((p) => p.id === selectedPool)?.lockupPeriod} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Stake:</span>{" "}
                      <span>
                        {pools.find((p) => p.id === selectedPool)?.minStake} {selectedToken}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span>{pools.find((p) => p.id === selectedPool)?.isLiquid ? "Liquid" : "Native"}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleStake}
                disabled={
                  isStaking ||
                  !selectedPool ||
                  !stakeAmount ||
                  Number.parseFloat(stakeAmount) <= 0 ||
                  Number.parseFloat(stakeAmount) > getTokenBalance(selectedToken)
                }
              >
                {isStaking ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Staking...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    <span>Stake Tokens</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Staking Positions</CardTitle>
              <CardDescription>Manage your active staking positions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : stakedPositions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any staking positions yet.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("stake")}>
                    Stake Now
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pool</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stakedPositions.map((position) => {
                      const pool = pools.find((p) => p.id === position.poolId)
                      return (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{pool?.name || "Unknown Pool"}</TableCell>
                          <TableCell>
                            {position.amount.toFixed(4)} {pool?.token}
                          </TableCell>
                          <TableCell>${position.value.toFixed(2)}</TableCell>
                          <TableCell>${position.rewards.toFixed(2)}</TableCell>
                          <TableCell>{new Date(position.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={position.isActive ? "default" : "secondary"}>
                              {position.isActive ? "Active" : "Ended"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {position.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnstake(position.id)}
                                disabled={isUnstaking}
                              >
                                {isUnstaking ? "Unstaking..." : "Unstake"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

