import { notFound } from 'next/navigation'

import { getForumThreadById } from '@/db/queries/forum'
import { getOptionalUser } from '@/lib/auth0'
import { getIsAdmin } from '@/lib/admin'
import { ThreadDetail } from '@/components/user/forum/ThreadDetail'

type ForumThreadPageProps = {
  params: {
    threadId: string
  }
}

export default async function ForumThreadPage({ params }: ForumThreadPageProps) {
  const threadId = Number(params.threadId)

  if (Number.isNaN(threadId)) {
    notFound()
  }

  const [thread, user, isAdmin] = await Promise.all([
    getForumThreadById(threadId),
    getOptionalUser(),
    getIsAdmin(),
  ])

  if (!thread) {
    notFound()
  }

  const viewer = user
    ? {
        id: user.id,
        name: user.name,
        avatar: user.picture,
        isAdmin,
      }
    : null

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ThreadDetail thread={thread} viewer={viewer} />
    </div>
  )
}
