import type { Route } from 'next'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

import { formatRelativeTime } from './utils'

type ForumThreadListItem = {
  id: number
  title: string
  body: string
  authorName: string
  authorAvatar: string
  createdAt: string | Date
  updatedAt: string | Date
  lastActivityAt: string | Date
  isPinned: boolean
  isLocked: boolean
  posts?: { id: number }[]
}

type ThreadListProps = {
  threads: ForumThreadListItem[]
}

function getPreview(body: string, length = 160) {
  const trimmed = body.trim()
  if (trimmed.length <= length) {
    return trimmed
  }
  return `${trimmed.slice(0, length - 1)}…`
}

export function ThreadList({ threads }: ThreadListProps) {
  if (!threads.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/40 p-12 text-center">
        <h2 className="text-2xl font-bold">Be the first to start a discussion</h2>
        <p className="mt-2 text-muted-foreground">
          There are no threads yet. Create one to kick off the BrainBytes community conversation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => {
        const replyCount = thread.posts?.length ?? 0
        return (
          <article
            key={thread.id}
            className="group rounded-2xl border-2 border-border bg-card/95 p-6 transition hover:border-primary/60 hover:shadow-lg"
          >
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 bg-primary/5 text-lg font-semibold">
                  <Image
                    src={thread.authorAvatar}
                    alt={thread.authorName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/forum/${thread.id}` as Route}
                      className="text-xl font-bold leading-tight text-foreground transition group-hover:text-primary"
                    >
                      {thread.title}
                    </Link>
                    {thread.isPinned && (
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                        Pinned
                      </span>
                    )}
                    {thread.isLocked && (
                      <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-xs font-semibold uppercase text-secondary">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Started by <strong>{thread.authorName}</strong> · {formatRelativeTime(thread.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="rounded-full border border-border px-3 py-1 font-semibold text-foreground/90">
                  {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground/80">
                  Updated {formatRelativeTime(thread.lastActivityAt)}
                </div>
              </div>
            </header>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {getPreview(thread.body)}
            </p>
            <div className="mt-4 flex justify-end">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/forum/${thread.id}` as Route}>
                  Open thread
                </Link>
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
