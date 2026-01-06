"use server";

import { ethers } from 'ethers';
import { db } from '@/db/drizzle';
import { userSubscription } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth0';
import { byteTokenContract } from '@/lib/ethers';

const SHOP_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS!;
const SUBSCRIPTION_COST_BYTE = 20000; // 20000 BYTE tokens for subscription (equivalent to $20)

export const createCryptoSubscription = async (txHash: string) => {
  const user = await requireUser();
  const userId = user.id;

  if (!txHash) {
    throw new Error("Transaction hash is required");
  }

  try {
    // Verify the transaction on blockchain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER_URL!);
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      throw new Error("Transaction not found on blockchain");
    }

    // Fetch the transaction receipt to inspect ERC20 Transfer events
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      throw new Error("Transaction receipt not found on blockchain");
    }
    if (receipt.status !== 1) {
      throw new Error("Transaction did not succeed");
    }

    // Determine the BYTE token contract address from the imported contract
    const tokenContractAddressRaw =
      (byteTokenContract as any).target ?? (byteTokenContract as any).address;
    if (!tokenContractAddressRaw) {
      throw new Error("BYTE token contract address is not configured");
    }
    const tokenContractAddress = tokenContractAddressRaw.toLowerCase();

    // Optionally ensure the transaction interacted with the BYTE token contract
    if (tx.to?.toLowerCase() !== tokenContractAddress) {
      throw new Error("Transaction was not sent to the BYTE token contract");
    }

    // Verify there is a Transfer event to the shop wallet for the expected amount
    const expectedAmount = ethers.parseUnits(SUBSCRIPTION_COST_BYTE.toString(), 18);
    const transferTopic = ethers.keccak256(ethers.toUtf8Bytes("Transfer(address,address,uint256)"));

    let validPaymentFound = false;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== tokenContractAddress) {
        continue;
      }
      if (!log.topics || log.topics.length === 0 || log.topics[0] !== transferTopic) {
        continue;
      }

      const parsedLog = byteTokenContract.interface.parseLog(log);
      if (!parsedLog) continue;

      const toAddress = (parsedLog.args.to as string).toLowerCase();
      const amount = parsedLog.args.value as bigint;

      if (
        toAddress === SHOP_WALLET_ADDRESS.toLowerCase() &&
        amount === expectedAmount
      ) {
        validPaymentFound = true;
        break;
      }
    }

    if (!validPaymentFound) {
      throw new Error("Valid BYTE token payment to the shop wallet was not found in transaction logs");
    }
    // Check if transaction hash has already been used
    const existingTxHash = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.cryptoPaymentTxHash, txHash),
    });

    if (existingTxHash) {
      throw new Error("This transaction hash has already been used for a subscription");
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    if (existingSubscription) {
      // Update existing subscription
      await db.update(userSubscription).set({
        cryptoSubscriptionId: txHash,
        cryptoPaymentTxHash: txHash,
        cryptoCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isCryptoSubscription: true,
        // Clear Stripe fields for crypto
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      }).where(eq(userSubscription.userId, userId));
    } else {
      // Create new subscription
      await db.insert(userSubscription).values({
        userId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        cryptoSubscriptionId: txHash,
        cryptoPaymentTxHash: txHash,
        cryptoCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isCryptoSubscription: true,
      });
    }

    return { success: true, message: "Crypto subscription activated successfully!" };
  } catch (error) {
    console.error("Error creating crypto subscription:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to create crypto subscription: ${error.message}`);
    }

    throw new Error("Failed to create crypto subscription: Unknown error");
  }
};