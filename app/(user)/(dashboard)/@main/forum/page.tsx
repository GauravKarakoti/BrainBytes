import { getForumThreads } from '@/db/queries/forum'
import { getOptionalUser } from '@/lib/auth0'
import { getIsAdmin } from '@/lib/admin'
import { ThreadComposer } from '@/components/user/forum/ThreadComposer'
import { ThreadList } from '@/components/user/forum/ThreadList'

export default async function ForumPage() {
  const [threads, user, isAdmin] = await Promise.all([
    getForumThreads(),
    getOptionalUser(),
    getIsAdmin(),
  ])

  const viewer = user
    ? {
        id: user.id,
        name: user.name,
        avatar: user.picture,
        isAdmin,
      }
    : null

  const composerUser = viewer
    ? {
        id: viewer.id,
        name: viewer.name,
        avatar: viewer.avatar,
      }
    : null

  const normalizedThreads = threads.map((thread) => ({
    ...thread,
    posts: thread.posts ?? [],
  }))

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-3xl border-2 border-primary/10 bg-primary/5 p-8 shadow-sm">
        <h1 className="text-4xl font-black">Community Forum</h1>
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">
          Connect with fellow BrainBytes learners, ask questions, share feedback, and help others grow. Our moderators keep the space friendly and supportive for everyone.
        </p>
      </section>
      <ThreadComposer currentUser={composerUser} />
      <ThreadList threads={normalizedThreads} />
    </div>
  )
}
