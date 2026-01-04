'use server'

import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { createPublicClient, http, decodeEventLog, parseUnits, type Address } from 'viem'
import { SHOP_ITEMS } from '@/config/shop'
import { B_DECIMALS } from '@/lib/ethers'
import { redeemedTransactions } from '@/db/schema'
import { requireUser } from '@/lib/auth0'

const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL!
const SHOP_WALLET_ADDRESS = (process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS as Address)!
const BYTE_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS as Address)!

const publicClient = createPublicClient({ transport: http(RPC_PROVIDER_URL) })
const byteTokenAbi = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  },
]

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
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })

    if (!receipt || receipt.status?.toString() !== '0x1' && receipt.status !== 1) {
      return { error: 'Transaction failed or not found.' }
    }

    const uProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })

    if (!uProgress || !uProgress.wallet_address) {
      return { error: 'User wallet not linked.' }
    }

    // receipt.from may not be present for some networks; skip strict check if missing
    if (receipt.from && receipt.from.toLowerCase() !== uProgress.wallet_address.toLowerCase()) {
      return { error: 'Transaction was not sent from your wallet.' }
    }

    const expectedAmount = parseUnits(item.byteCost.toString(), B_DECIMALS)

    let transferValid = false
    for (const log of receipt.logs ?? []) {
      if (log.address.toLowerCase() === String(BYTE_TOKEN_ADDRESS).toLowerCase()) {
        try {
          const parsed = decodeEventLog({ abi: byteTokenAbi as any, data: log.data, topics: log.topics })
          // decoded args will be in `args` with named keys matching inputs
          if (parsed && parsed.eventName === 'Transfer') {
            const from = (parsed.args as any).from as string
            const to = (parsed.args as any).to as string
            const value = (parsed.args as any).value as bigint

            if (
              from.toLowerCase() === uProgress.wallet_address.toLowerCase() &&
              to.toLowerCase() === SHOP_WALLET_ADDRESS.toLowerCase() &&
              value === expectedAmount
            ) {
              transferValid = true
              break
            }
          }
        } catch (e) {
          console.error('Failed to decode event log during redemption verification:', {
            txHash,
            log,
            error: e,
          });
        }
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