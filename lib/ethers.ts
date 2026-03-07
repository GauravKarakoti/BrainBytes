import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseUnits as viemParseUnits, 
  formatUnits as viemFormatUnits, 
  type Address 
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts' // 1. Fix account import
import { sepolia } from 'viem/chains' // 2. Import your target chain

const BYTE_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS as Address)
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY
const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL

if (!BYTE_TOKEN_ADDRESS || !SERVER_WALLET_PRIVATE_KEY || !RPC_PROVIDER_URL) {
  throw new Error('Missing blockchain environment variables')
}

const normalizedServerWalletPrivateKey = (SERVER_WALLET_PRIVATE_KEY.startsWith('0x')
  ? SERVER_WALLET_PRIVATE_KEY
  : `0x${SERVER_WALLET_PRIVATE_KEY}`) as `0x${string}`

const publicClient = createPublicClient({ 
  chain: sepolia, // 3. Bind public client to chain
  transport: http(RPC_PROVIDER_URL) 
})

const walletClient = createWalletClient({
  chain: sepolia, // 4. Bind wallet client to chain to fix TS2345
  transport: http(RPC_PROVIDER_URL),
  account: privateKeyToAccount(normalizedServerWalletPrivateKey)
})

// 5. Using `as const` gives you strict typing for the functionName and args in viem
const byteTokenAbi = [
  "function mint(address to, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
] as const; 

export const B_DECIMALS = 18

export async function mintByte(to: Address, amount: bigint) {
  return walletClient.writeContract({ 
    address: BYTE_TOKEN_ADDRESS, 
    abi: byteTokenAbi, 
    functionName: 'mint', 
    args: [to, amount] 
  })
}

export async function readByteBalance(address: Address) {
  const balance = await publicClient.readContract({ 
    address: BYTE_TOKEN_ADDRESS, 
    abi: [{ type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }], 
    functionName: 'balanceOf', 
    args: [address] 
  })
  return balance as bigint
}

export const formatUnits = (value: bigint, decimals: number = B_DECIMALS) =>
  viemFormatUnits(value, decimals)
  
export const parseUnitsFn = (value: string, decimals: number = B_DECIMALS) =>
  viemParseUnits(value, decimals)