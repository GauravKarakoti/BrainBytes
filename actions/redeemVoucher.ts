'use server'

import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { ethers } from 'ethers'
import { SHOP_ITEMS } from '@/config/shop'
import { B_DECIMALS } from '@/lib/ethers'
import { redeemedTransactions } from '@/db/schema' 
import { requireUser } from '@/lib/auth0'

const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL!;
const SHOP_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS!;
const BYTE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS!;

const byteTokenAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export async function verifyRedemption(itemId: number, txHash: string) {
  const user = await requireUser()
  const userId = user.id

  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item || !item.byteCost) {
    return { error: 'Item not found or not redeemable with BYTE' }
  }

  const existingTx = await db.query.redeemedTransactions.findFirst({
    where: eq(redeemedTransactions.txHash, txHash),
  });
  if (existingTx) {
    return { error: 'Transaction already redeemed.' }
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_PROVIDER_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || receipt.status !== 1) {
      return { error: 'Transaction failed or not found.' }
    }
    
    const uProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });
    
    if (!uProgress || !uProgress.wallet_address) {
       return { error: 'User wallet not linked.' }
    }

    if (receipt.from.toLowerCase() !== uProgress.wallet_address.toLowerCase()) {
      return { error: 'Transaction was not sent from your wallet.' }
    }

    const contract = new ethers.Interface(byteTokenAbi);
    const expectedAmount = ethers.parseUnits(item.byteCost.toString(), B_DECIMALS);
    
    let transferValid = false;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === BYTE_TOKEN_ADDRESS.toLowerCase()) {
        try {
          const parsedLog = contract.parseLog(log);
          if (parsedLog && parsedLog.name === 'Transfer') {
            const [from, to, value] = parsedLog.args;
            if (
              from.toLowerCase() === uProgress.wallet_address.toLowerCase() &&
              to.toLowerCase() === SHOP_WALLET_ADDRESS.toLowerCase() &&
              value === expectedAmount
            ) {
              transferValid = true;
              break;
            }
          }
        } catch (e) { }
      }
    }

    if (!transferValid) {
      return { error: 'Transaction data does not match purchase details.' }
    }

    await db.insert(redeemedTransactions).values({
      txHash: txHash,
      userId: userId,
      itemId: item.id,
    });

    if (item.hearts > 0) {
      await db
        .update(userProgress)
        .set({
          hearts: sql`${userProgress.hearts} + ${item.hearts}`,
        })
        .where(eq(userProgress.userId, userId));
    }
        
    revalidateTag(`get_user_progress::${userId}`);
    revalidateTag('get_user_progress');

    return { success: true };

  } catch (error: any) {
    console.error("Redemption verification failed:", error);
    return { error: "Failed to verify transaction." }
  }
}