'use server'

import { revalidateTag } from 'next/cache'
import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { isAddress } from 'viem'
import { requireUser } from '@/lib/auth0'

export const savewallet_address = async (wallet_address: string) => {
  const user = await requireUser()
  const userId = user.id

  if (!isAddress(wallet_address)) {
    return { error: 'Invalid wallet address' }
  }

  try {
    await db
      .update(userProgress)
      .set({
        wallet_address: wallet_address,
      })
      .where(eq(userProgress.userId, userId))

    revalidateTag(`get_user_progress::${userId}`)
    revalidateTag('get_user_progress')
    console.log("Wallet Updated:",userProgress)
    return { success: true, wallet_address: wallet_address }
  } catch (error) {
    console.error('Error saving wallet address:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        return { error: 'This wallet is already connected to another account' }
    }
    return { error: 'Failed to save wallet address' }
  }
}