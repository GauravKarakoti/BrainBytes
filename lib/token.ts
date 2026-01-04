'use server'
import { getUserProgress } from '@/db/queries/userProgress'
import { requireUser } from '@/lib/auth0'
import { readByteBalance, formatUnits } from '@/lib/ethers'

const contractAddress = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS
const rpcUrl = process.env.RPC_PROVIDER_URL

if (!contractAddress || !rpcUrl) {
  console.warn(
    'Token contract address or RPC URL is not set in environment variables.'
  )
}

export const getByteBalance = async (
  wallet_address: string
): Promise<string> => {
  if (!wallet_address) {
    return '0.0'
  }

  try {
    const balance = await readByteBalance(wallet_address)
    const formattedBalance = formatUnits(balance, 18)
    return parseFloat(formattedBalance).toFixed(2)
  } catch (error) {
    console.error('[BYTE_BALANCE_FETCH] Failed to fetch token balance:', error)
    return '0.0'
  }
}

export async function BYTEBalance() {
  const user = await requireUser()

  const userProgress = await getUserProgress(user.id)

  if (!userProgress?.wallet_address) {
    return '0.0'
  }

  return getByteBalance(userProgress.wallet_address)
}