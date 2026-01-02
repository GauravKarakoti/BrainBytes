import { ethers } from 'ethers';

const BYTE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS!; 
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY!;
const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL!;

if (!BYTE_TOKEN_ADDRESS || !SERVER_WALLET_PRIVATE_KEY || !RPC_PROVIDER_URL) {
  throw new Error("Missing blockchain environment variables");
}

const provider = new ethers.JsonRpcProvider(RPC_PROVIDER_URL);
const serverWallet = new ethers.Wallet(SERVER_WALLET_PRIVATE_KEY, provider);

const byteTokenAbi = [
  "function mint(address to, uint256 amount)"
];

export const byteTokenContract = new ethers.Contract(BYTE_TOKEN_ADDRESS, byteTokenAbi, serverWallet);

export const B_DECIMALS = 18;