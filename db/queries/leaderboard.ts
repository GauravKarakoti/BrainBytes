'use server'

import { unstable_cache as NextCache } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

import { db } from '@/db/drizzle'

export const getTopUsers = async () => {
  return NextCache(
    async () => {
      return await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 10,
        columns: {
          userId: true,
          userName: true,
          userImgSrc: true,
          points: true,
        },
      })
    },
    ['top_users'],
    { revalidate: 60, tags: ['top_users'] }
  )()
}

export const getUserRank = async (userId?: string | null) => {
  if (userId === null) return null

  let _userId = userId

  if (!_userId) {
    const { userId: _uid } = await auth()
    if (!_uid) return null
    _userId = _uid
  }

  return NextCache(
    async (_uid: string) => {
      const allUsers = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        columns: {
          userId: true,
          points: true,
        },
      })

      const userIndex = allUsers.findIndex((user) => user.userId === _uid)
      return userIndex === -1 ? null : userIndex + 1
    },
    ['user_rank', _userId as string],
    { revalidate: 60, tags: ['user_rank', `user_rank::${_userId}`] }
  )(_userId as string)
}
