'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { forumPosts, forumThreads } from '@/db/schema'
import { requireUser } from '@/lib/auth0'
import { getIsAdmin } from '@/lib/admin'
import { getForumPostById } from '@/db/queries/forum'

type CreateThreadInput = {
  title: string
  body: string
}

type UpdateThreadInput = {
  title?: string
  body?: string
  isPinned?: boolean
  isLocked?: boolean
}

type CreatePostInput = {
  threadId: number
  parentPostId?: number | null
  body: string
}

type UpdatePostInput = {
  postId: number
  body: string
}

type DeletePostInput = {
  postId: number
}

const FORUM_LIST_PATH = '/forum'

function sanitizeContent(value: string | undefined | null) {
  return value?.trim() ?? ''
}

export async function createThread(input: CreateThreadInput) {
  const user = await requireUser()
  const title = sanitizeContent(input.title)
  const body = sanitizeContent(input.body)

  if (!title) {
    return { error: 'Title is required.' }
  }

  if (!body) {
    return { error: 'Body is required.' }
  }

  const [thread] = await db
    .insert(forumThreads)
    .values({
      title,
      body,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.picture,
    })
    .returning({ id: forumThreads.id })

  revalidatePath(FORUM_LIST_PATH)
  revalidatePath(`${FORUM_LIST_PATH}/${thread.id}`)

  return { success: true, threadId: thread.id }
}

export async function updateThread(threadId: number, input: UpdateThreadInput) {
  const user = await requireUser()
  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, threadId),
  })

  if (!thread) {
    return { error: 'Thread not found.' }
  }

  const isAdmin = await getIsAdmin()

  if (thread.authorId !== user.id && !isAdmin) {
    return { error: 'You do not have permission to modify this thread.' }
  }

  const updates: Partial<typeof forumThreads.$inferInsert> = {
    updatedAt: new Date(),
  }

  if (typeof input.title === 'string') {
    const title = sanitizeContent(input.title)
    if (!title) {
      return { error: 'Title is required.' }
    }
    updates.title = title
  }

  if (typeof input.body === 'string') {
    const body = sanitizeContent(input.body)
    if (!body) {
      return { error: 'Body is required.' }
    }
    updates.body = body
  }

  if (isAdmin) {
    if (typeof input.isPinned === 'boolean') {
      updates.isPinned = input.isPinned
    }

    if (typeof input.isLocked === 'boolean') {
      updates.isLocked = input.isLocked
    }
  }

  await db.update(forumThreads).set(updates).where(eq(forumThreads.id, threadId))

  revalidatePath(FORUM_LIST_PATH)
  revalidatePath(`${FORUM_LIST_PATH}/${threadId}`)

  return { success: true }
}

export async function deleteThread(threadId: number) {
  const user = await requireUser()
  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, threadId),
  })

  if (!thread) {
    return { error: 'Thread not found.' }
  }

  const isAdmin = await getIsAdmin()

  if (thread.authorId !== user.id && !isAdmin) {
    return { error: 'You do not have permission to delete this thread.' }
  }

  await db.delete(forumThreads).where(eq(forumThreads.id, threadId))

  revalidatePath(FORUM_LIST_PATH)
  revalidatePath(`${FORUM_LIST_PATH}/${threadId}`)

  return { success: true }
}

export async function createPost(input: CreatePostInput) {
  const user = await requireUser()
  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, input.threadId),
  })

  if (!thread) {
    return { error: 'Thread not found.' }
  }

  const isAdmin = await getIsAdmin()

  if (thread.isLocked && !isAdmin) {
    return { error: 'Thread is locked.' }
  }

  const body = sanitizeContent(input.body)

  if (!body) {
    return { error: 'Reply cannot be empty.' }
  }

  if (input.parentPostId) {
    const parentPost = await db.query.forumPosts.findFirst({
      where: and(eq(forumPosts.id, input.parentPostId), eq(forumPosts.threadId, input.threadId)),
    })

    if (!parentPost) {
      return { error: 'Reply target not found.' }
    }
  }

  const [post] = await db
    .insert(forumPosts)
    .values({
      threadId: input.threadId,
      parentPostId: input.parentPostId ?? null,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.picture,
      body,
    })
    .returning({ id: forumPosts.id })

  const now = new Date()

  await db
    .update(forumThreads)
    .set({
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(forumThreads.id, input.threadId))

  revalidatePath(FORUM_LIST_PATH)
  revalidatePath(`${FORUM_LIST_PATH}/${input.threadId}`)

  return { success: true, postId: post.id }
}

export async function updatePost(input: UpdatePostInput) {
  const user = await requireUser()
  const post = await getForumPostById(input.postId)

  if (!post) {
    return { error: 'Post not found.' }
  }

  const isAdmin = await getIsAdmin()

  if (post.authorId !== user.id && !isAdmin) {
    return { error: 'You do not have permission to modify this post.' }
  }

  const body = sanitizeContent(input.body)

  if (!body) {
    return { error: 'Reply cannot be empty.' }
  }

  await db
    .update(forumPosts)
    .set({
      body,
      updatedAt: new Date(),
    })
    .where(eq(forumPosts.id, input.postId))

  revalidatePath(`${FORUM_LIST_PATH}/${post.threadId}`)

  return { success: true }
}

export async function deletePost(input: DeletePostInput) {
  const user = await requireUser()
  const post = await getForumPostById(input.postId)

  if (!post) {
    return { error: 'Post not found.' }
  }

  const isAdmin = await getIsAdmin()

  if (post.authorId !== user.id && !isAdmin) {
    return { error: 'You do not have permission to delete this post.' }
  }

  await db
    .update(forumPosts)
    .set({
      isDeleted: true,
      body: '[deleted]',
      updatedAt: new Date(),
    })
    .where(eq(forumPosts.id, input.postId))

  revalidatePath(`${FORUM_LIST_PATH}/${post.threadId}`)

  return { success: true }
}
