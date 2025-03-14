"use client"

import type { ReactNode } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WalletContextProvider } from "@/contexts/WalletContext"
import { ChatProvider } from "@/contexts/ChatContext"
import { PriceAlertProvider } from "@/contexts/PriceAlertContext"
import { StakingProvider } from "@/contexts/StakingContext"
import { SwapProvider } from "@/contexts/SwapContext"
import { LendingProvider } from "@/contexts/LendingContext"
import "./globals.css"

// Import Wallet Adapter UI styles
import "@solana/wallet-adapter-react-ui/styles.css"

// Define the network (use mainnet-beta for production)
const network = WalletAdapterNetwork.MainnetBeta
const endpoint = clusterApiUrl(network)

// List of wallets to support
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Grok 3 by xAI - Crypto Assistant</title>
        <meta name="description" content="Advanced cryptocurrency AI assistant with wallet integration" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={false}>
              <WalletModalProvider>
                <WalletContextProvider>
                  <PriceAlertProvider>
                    <StakingProvider>
                      <SwapProvider>
                        <LendingProvider>
                          <ChatProvider>
                            {children}
                            <Toaster />
                          </ChatProvider>
                        </LendingProvider>
                      </SwapProvider>
                    </StakingProvider>
                  </PriceAlertProvider>
                </WalletContextProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
