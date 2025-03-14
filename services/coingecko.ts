import axios from "axios"

const COINGECKO_API = "https://api.coingecko.com/api/v3"

interface CoinGeckoPrice {
  current_price: number
  price_change_percentage_24h: number
}

export async function getTokenPrices(tokens: string[]): Promise<Record<string, CoinGeckoPrice>> {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: "usd",
        ids: tokens.join(","),
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
    })

    const formatted: Record<string, CoinGeckoPrice> = {}
    response.data.forEach((coin: any) => {
      formatted[coin.id] = {
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
      }
    })
    return formatted
  } catch (error) {
    console.error("Failed to fetch prices from CoinGecko:", error)
    // Return fallback data if API fails
    return {
      solana: { current_price: 150, price_change_percentage_24h: 2.5 },
      "usd-coin": { current_price: 1, price_change_percentage_24h: 0 },
      "sonic-token": { current_price: 2.5, price_change_percentage_24h: 5.2 },
    }
  }
}

