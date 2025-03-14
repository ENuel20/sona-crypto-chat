"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
} from "chart.js"
import dynamic from "next/dynamic"
import { useWalletContext } from "@/contexts/WalletContext"
import { useStakingContext } from "@/contexts/StakingContext"
import { useLendingContext } from "@/contexts/LendingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@solana/wallet-adapter-react"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ArcElement)

// Dynamically import Chart.js to avoid SSR issues
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <div className="animate-pulse text-muted-foreground">Loading chart...</div>
    </div>
  ),
})

const Doughnut = dynamic(() => import("react-chartjs-2").then((mod) => mod.Doughnut), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <div className="animate-pulse text-muted-foreground">Loading chart...</div>
    </div>
  ),
})

interface PriceData {
  timestamp: number
  price: number
}

export function PortfolioOverview() {
  const { connected } = useWallet()
  const { tokenBalances, totalBalance, isLoading } = useWalletContext()
  const { getTotalStakedValue, getTotalRewards } = useStakingContext()
  const { getTotalSupplied, getTotalBorrowed } = useLendingContext()
  const [portfolioHistory, setPortfolioHistory] = useState<PriceData[]>([])

  // Generate mock portfolio history data
  useEffect(() => {
    if (connected) {
      const mockData = generateMockPortfolioHistory(totalBalance)
      setPortfolioHistory(mockData)
    }
  }, [connected, totalBalance])

  const totalStaked = getTotalStakedValue()
  const totalSupplied = getTotalSupplied()
  const totalBorrowed = getTotalBorrowed()
  const totalRewards = getTotalRewards()

  // Portfolio allocation data for doughnut chart
  const allocationData = {
    labels: tokenBalances.map((token) => token.symbol),
    datasets: [
      {
        data: tokenBalances.map((token) => token.value),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // blue
          "rgba(139, 92, 246, 0.8)", // purple
          "rgba(16, 185, 129, 0.8)", // green
          "rgba(245, 158, 11, 0.8)", // amber
          "rgba(239, 68, 68, 0.8)", // red
        ],
        borderWidth: 1,
      },
    ],
  }

  // Portfolio history chart data
  const historyChartData = {
    labels: portfolioHistory.map((d) => {
      const date = new Date(d.timestamp)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolioHistory.map((d) => d.price),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          callback: (value: number) => `$${value}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to view your portfolio overview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">${totalBalance.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{tokenBalances.length} tokens</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Staked</CardDescription>
            <CardTitle className="text-2xl">${totalStaked.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Rewards: ${totalRewards.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Supplied</CardDescription>
            <CardTitle className="text-2xl">${totalSupplied.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">In lending protocols</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Borrowed</CardDescription>
            <CardTitle className="text-2xl">${totalBorrowed.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">From lending protocols</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio History</CardTitle>
            <CardDescription>30-day value trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : (
                <Line data={historyChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Distribution by token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading || tokenBalances.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : (
                <Doughnut data={allocationData} options={doughnutOptions} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function for mock portfolio history data
function generateMockPortfolioHistory(currentValue: number): PriceData[] {
  const data: PriceData[] = []
  const now = Date.now()
  const baseValue = currentValue * 0.8 // Start at 80% of current value

  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const dayOffset = 29 - i
    const timestamp = now - dayOffset * 24 * 60 * 60 * 1000

    // Create a generally upward trend with some volatility
    const volatilityFactor = 0.03 // 3% daily volatility
    const trendFactor = 0.007 // 0.7% daily upward trend

    const dayVolatility = (Math.random() * 2 - 1) * volatilityFactor
    const dayTrend = dayOffset * trendFactor

    const value = baseValue * (1 + dayTrend + dayVolatility)

    data.push({
      timestamp,
      price: value,
    })
  }

  return data
}

