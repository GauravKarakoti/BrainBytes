import { createPublicClient, createWalletClient, http, privateKeyToAccount, parseUnits as viemParseUnits, formatUnits as viemFormatUnits, type Address } from 'viem'

const BYTE_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS as Address) ?? ''
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY ?? ''
const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL ?? ''

if (!BYTE_TOKEN_ADDRESS || !SERVER_WALLET_PRIVATE_KEY || !RPC_PROVIDER_URL) {
  throw new Error('Missing blockchain environment variables')
}

const publicClient = createPublicClient({ transport: http(RPC_PROVIDER_URL) })
const walletClient = createWalletClient({
  transport: http(RPC_PROVIDER_URL),
  account: privateKeyToAccount(SERVER_WALLET_PRIVATE_KEY)
})

const byteTokenAbi = [
  { type: 'function', name: 'mint', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }] }
]

export const B_DECIMALS = 18

export async function mintByte(to: Address, amount: bigint) {
  return walletClient.writeContract({ address: BYTE_TOKEN_ADDRESS, abi: byteTokenAbi as any, functionName: 'mint', args: [to, amount] })
}

export async function readByteBalance(address: Address) {
  const balance = await publicClient.readContract({ address: BYTE_TOKEN_ADDRESS, abi: [{ type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }], functionName: 'balanceOf', args: [address] })
  return balance as bigint
}

export const formatUnits = (value: bigint, decimals: number = B_DECIMALS) =>
  viemFormatUnits(value, decimals)
export const parseUnitsFn = (value: string, decimals: number = B_DECIMALS) =>
  viemParseUnits(value, decimals)
