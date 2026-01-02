"use server";

import { db } from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { requireUser } from "@/lib/auth0";
import { ethers } from "ethers";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Initialize crypto payment for subscription
 * Generates a unique payment reference and stores it
 */
export const initiateCryptoSubscriptionPayment = async (
  planId: string,
  walletAddress: string,
  amount: number // in smallest unit (e.g., wei for ETH)
) => {
  const user = await requireUser();

  // Verify wallet address format
  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  // Generate a unique payment reference
  const paymentReference = crypto.randomBytes(16).toString("hex");

  // Store pending crypto subscription
  await db.insert(userSubscription).values({
    userId: user.id,
    planId,
    paymentMethod: "crypto",
    walletAddress,
    status: "pending",
    isActive: false,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: userSubscription.userId,
    set: {
      planId,
      paymentMethod: "crypto",
      walletAddress,
      status: "pending",
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    paymentReference,
    walletAddress,
    amount,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "11155111", // Sepolia by default
  };
};

/**
 * Confirm crypto payment after transaction is verified
 */
export const confirmCryptoSubscriptionPayment = async (
  userId: string,
  txnHash: string,
  planId: string
) => {
  // Verify transaction hash format
  if (!txnHash.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error("Invalid transaction hash");
  }

  // Get transaction details from RPC (in production, verify it's confirmed)
  // For now, we'll trust the txn hash provided
  const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Update subscription as active
  await db
    .update(userSubscription)
    .set({
      txnHash,
      status: "active",
      isActive: true,
      currentPeriodStart: new Date(),
      currentPeriodEnd,
      renewalDate: currentPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.userId, userId));

  return { success: true, message: "Crypto payment confirmed" };
};

/**
 * Get crypto subscription payment details
 */
export const getCryptoSubscriptionDetails = async (planId: string) => {
  const plan = await db.query.subscriptionPlans.findFirst({
    where: ({ id }, { eq }) => eq(id, planId),
    with: {
      features: true,
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  // Convert price to crypto (example: using ethers to handle conversions)
  const priceInUSD = plan.monthlyPrice / 100; // Convert cents to dollars

  return {
    plan,
    priceInUSD,
    priceInWei: ethers.parseEther("0.05").toString(), // Example: 0.05 ETH
    contractAddress: process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS,
    shopWalletAddress: process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "11155111",
  };
};

/**
 * Renew crypto subscription
 */
export const renewCryptoSubscription = async (txnHash: string) => {
  const user = await requireUser();

  // Verify transaction
  if (!txnHash.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error("Invalid transaction hash");
  }

  const currentSubscription = await db.query.userSubscription.findFirst({
    where: ({ userId }, { eq }) => eq(userId, user.id),
  });

  if (!currentSubscription) {
    throw new Error("No subscription found");
  }

  const newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(userSubscription)
    .set({
      txnHash,
      currentPeriodStart: new Date(),
      currentPeriodEnd: newPeriodEnd,
      renewalDate: newPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.userId, user.id));

  return { success: true, message: "Subscription renewed via crypto" };
};
