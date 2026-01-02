import { createPublicClient, createWalletClient, http, getContract, parsePrivateKeyToAccount, defineChain } from 'viem'
import { sepolia, mainnet } from 'viem/chains'

const BYTE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS as `0x${string}` | undefined
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY as `0x${string}` | undefined
const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL as string | undefined
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia'

// Determine chain based on environment
const getChain = () => {
  switch (NETWORK_NAME.toLowerCase()) {
    case 'mainnet':
      return mainnet
    case 'sepolia':
      return sepolia
    default:
      // Default to sepolia for development/testing
      return sepolia
  }
}

const chain = getChain()

// Validate environment variables
if (!BYTE_TOKEN_ADDRESS) {
  console.warn('NEXT_PUBLIC_BYTE_TOKEN_ADDRESS is not set')
}

if (!SERVER_WALLET_PRIVATE_KEY) {
  console.warn('SERVER_WALLET_PRIVATE_KEY is not set')
}

if (!RPC_PROVIDER_URL) {
  console.warn('RPC_PROVIDER_URL is not set')
}

// Byte Token ABI for mint function
const byteTokenAbi = [
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      { name: 'account', type: 'address' }
    ],
    outputs: [
      { type: 'uint256' }
    ],
    stateMutability: 'view'
  }
] as const

// Create account from private key if available
let account: ReturnType<typeof parsePrivateKeyToAccount> | undefined
if (SERVER_WALLET_PRIVATE_KEY) {
  try {
    account = parsePrivateKeyToAccount(SERVER_WALLET_PRIVATE_KEY)
  } catch (error) {
    console.error('Failed to parse wallet private key:', error)
  }
}

// Create public client for reading
export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_PROVIDER_URL || 'https://rpc.sepolia.dev')
})

// Create wallet client for writing (only if account is available)
export const walletClient = account ? createWalletClient({
  account,
  chain,
  transport: http(RPC_PROVIDER_URL || 'https://rpc.sepolia.dev')
}) : null

// Get contract instance (only if address is available)
export const byteTokenContract = BYTE_TOKEN_ADDRESS ? getContract({
  address: BYTE_TOKEN_ADDRESS,
  abi: byteTokenAbi,
  client: { public: publicClient, wallet: walletClient || undefined }
}) : null

export const B_DECIMALS = 18

