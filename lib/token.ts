'use server'
import { getUserProgress } from '@/db/queries/userProgress'
import { auth } from '@clerk/nextjs/server'
import { ethers } from 'ethers'

const contractAddress = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS
const rpcUrl = process.env.RPC_PROVIDER_URL

if (!contractAddress || !rpcUrl) {
  console.warn(
    'Token contract address or RPC URL is not set in environment variables.'
  )
}

const abi = ['function balanceOf(address owner) view returns (uint256)']

let provider: ethers.JsonRpcProvider | null = null
let contract: ethers.Contract | null = null

if (rpcUrl) {
  provider = new ethers.JsonRpcProvider(rpcUrl)
}

if (provider && contractAddress) {
  contract = new ethers.Contract(contractAddress, abi, provider)
}

export const getByteBalance = async (
  walletAddress: string
): Promise<string> => {
  if (!contract || !walletAddress) {
    return '0.0'
  }

  try {
    const balance = await contract.balanceOf(walletAddress)
    const formattedBalance = ethers.formatUnits(balance, 18)
    
    return parseFloat(formattedBalance).toFixed(2)
  } catch (error) {
    console.error('[BYTE_BALANCE_FETCH] Failed to fetch token balance:', error)
    return '0.0'
  }
}

export async function BYTEBalance() {
  const { userId } = await auth()

  const userProgress = await getUserProgress(userId)

  let byteBalance = '0.0'
  if (userProgress!.walletAddress) {
    byteBalance = await getByteBalance(userProgress!.walletAddress)
  }

  return byteBalance;
}