'use server'

import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
// 1. Import the viem helpers exported from your lib instead of the non-existent ethers contract
import { mintByte, parseUnitsFn, B_DECIMALS } from '@/lib/ethers'
import { Address } from 'viem' // 2. Import Address type from viem for type casting
import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { requireUser } from '@/lib/auth0'

export async function claimPendingTokens() {
  const user = await requireUser()
  const userId = user.id

  console.log('[claimPendingTokens] Starting claim for user:', userId)

  // Get current user progress
  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (!currentUserProgress) {
    console.error('[claimPendingTokens] User progress not found')
    return { error: 'user_not_found' }
  }

  // Check if wallet address exists
  if (!currentUserProgress.wallet_address) {
    console.error('[claimPendingTokens] No wallet address found')
    return { error: 'no_wallet' }
  }

  // Check if there are pending tokens
  const pendingTokens = currentUserProgress.pendingTokens || 0
  if (pendingTokens <= 0) {
    console.log('[claimPendingTokens] No pending tokens to claim')
    return { error: 'no_pending_tokens' }
  }

  try {
    // 3. Use your exported viem parseUnitsFn
    const amount = parseUnitsFn(pendingTokens.toString(), B_DECIMALS)
    
    // 4. Use your exported viem mintByte function (make sure to cast the address)
    const txHash = await mintByte(currentUserProgress.wallet_address as Address, amount)
    
    console.log(`[claimPendingTokens] Minting ${pendingTokens} BYTE to ${currentUserProgress.wallet_address}`)
    console.log(`[claimPendingTokens] Transaction hash: ${txHash}`)

    // Reset pending tokens to 0 after successful mint
    await db
      .update(userProgress)
      .set({
        pendingTokens: 0,
      })
      .where(eq(userProgress.userId, userId))

    console.log('[claimPendingTokens] Successfully claimed tokens')

    // Revalidate user progress
    revalidateTag(`get_user_progress::${userId}`)
    revalidateTag('get_user_progress')

    return { 
      success: true, 
      amount: pendingTokens,
      txHash: txHash // 5. Return the txHash directly
    }
  } catch (error: any) {
    console.error('[claimPendingTokens] Failed to mint tokens:', error)
    
    // Return detailed error information
    return { 
      error: 'minting_failed',
      message: error?.message || 'Unknown error occurred',
      details: error?.reason || error?.code || 'No additional details'
    }
  }
}

export async function getPendingTokens() {
  const user = await requireUser()
  const userId = user.id

  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (!currentUserProgress) {
    return { pendingTokens: 0 }
  }

  return { 
    pendingTokens: currentUserProgress.pendingTokens || 0,
    hasWallet: !!currentUserProgress.wallet_address 
  }
}