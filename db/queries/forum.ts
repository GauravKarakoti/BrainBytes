'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { forumPosts, forumThreads } from '@/db/schema'

export const getForumThreads = async () => {
  return db.query.forumThreads.findMany({
    orderBy: (thread, { desc }) => [desc(thread.isPinned), desc(thread.lastActivityAt)],
    columns: {
      id: true,
      title: true,
      body: true,
      authorId: true,
      authorName: true,
      authorAvatar: true,
      isPinned: true,
      isLocked: true,
      createdAt: true,
      updatedAt: true,
      lastActivityAt: true,
    },
    with: {
      posts: {
        columns: {
          id: true,
        },
      },
    },
  })
}

export const getForumThreadById = async (threadId: number) => {
  return db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, threadId),
    with: {
      posts: {
        orderBy: (post, { asc }) => [asc(post.createdAt)],
      },
    },
  })
}

export const getForumPostById = async (postId: number) => {
  return db.query.forumPosts.findFirst({
    where: eq(forumPosts.id, postId),
  })
}
