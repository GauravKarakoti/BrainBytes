import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL;
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (SERVER_WALLET_PRIVATE_KEY === "") {
  console.warn("WARNING: SERVER_WALLET_PRIVATE_KEY is not set. Using a default, insecure key for local testing.");
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: RPC_PROVIDER_URL,
      accounts: SERVER_WALLET_PRIVATE_KEY ? [SERVER_WALLET_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
};

export default config;