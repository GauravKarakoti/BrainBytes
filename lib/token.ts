'use server'
import { getUserProgress } from '@/db/queries/userProgress'
import { requireUser } from '@/lib/auth0'
import { publicClient } from '@/lib/viem'
import { formatUnits } from 'viem'

const contractAddress = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS as `0x${string}` | undefined
const rpcUrl = process.env.RPC_PROVIDER_URL

if (!contractAddress || !rpcUrl) {
  console.warn(
    'Token contract address or RPC URL is not set in environment variables.'
  )
}

const abi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  }
] as const

export const getByteBalance = async (
  wallet_address: string
): Promise<string> => {
  if (!contractAddress || !wallet_address) {
    return '0.0'
  }

  try {
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'balanceOf',
      args: [wallet_address as `0x${string}`]
    })

    const formattedBalance = formatUnits(balance as bigint, 18)
    
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