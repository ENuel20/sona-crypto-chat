import type { Connection, PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

export async function getTokenBalances(
  connection: Connection,
  walletAddress: PublicKey,
  tokenMints: string[],
): Promise<Record<string, number>> {
  try {
    // Get all token accounts for the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, { programId: TOKEN_PROGRAM_ID })

    // Create a map of mint address to balance
    const balances: Record<string, number> = {}

    // Convert token mints to PublicKey objects for comparison
    const mintPublicKeys = tokenMints.map((mint) => mint.toString())

    // Process each token account
    tokenAccounts.value.forEach((tokenAccount) => {
      const accountData = tokenAccount.account.data.parsed.info
      const mintAddress = accountData.mint
      const balance = accountData.tokenAmount.uiAmount

      // Check if this mint is in our list of requested mints
      if (mintPublicKeys.includes(mintAddress)) {
        balances[mintAddress] = balance
      }
    })

    return balances
  } catch (error) {
    console.error("Error fetching token balances:", error)
    return {}
  }
}

