'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'

import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { SHOP_ITEMS } from '@/config/shop'

export async function purchaseHearts(itemId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const item = SHOP_ITEMS.find((i) => i.id === itemId)

  if (!item) {
    throw new Error('Item not found')
  }

  const existingUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (!existingUserProgress) {
    throw new Error('User progress not found')
  }

  if (existingUserProgress.points < item.points) {
    throw new Error('Not enough points')
  }

  if ('gemsRequired' in item && item.gemsRequired && existingUserProgress.gems < item.gemsRequired) {
    throw new Error('Not enough gems')
  }

  await db
    .update(userProgress)
    .set({
      hearts: existingUserProgress.hearts + item.hearts,
      points: existingUserProgress.points - item.points,
      gems:
        'gemsRequired' in item && item.gemsRequired
          ? existingUserProgress.gems - item.gemsRequired
          : existingUserProgress.gems,
    })
    .where(eq(userProgress.userId, userId))

  revalidatePath('/shop')
  revalidateTag(`get_user_progress::${userId}`)
  revalidateTag('get_user_progress')

  return { success: true }
}
