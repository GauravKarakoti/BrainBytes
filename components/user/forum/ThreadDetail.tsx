'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import Image from 'next/image'
import { toast } from 'sonner'

import { updateThread, deleteThread, updatePost, deletePost } from '@/actions/forum'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

import { PostComposer } from './PostComposer'
import { ensureDate, formatRelativeTime, type ForumViewer } from './utils'

import type { InferSelectModel } from 'drizzle-orm'
import type { forumPosts, forumThreads } from '@/db/schema'

type ForumPost = InferSelectModel<typeof forumPosts>

type ForumThreadDetail = InferSelectModel<typeof forumThreads> & {
  posts: ForumPost[]
}

type ThreadDetailProps = {
  thread: ForumThreadDetail
  viewer: ForumViewer | null
}

type ReplyTarget = {
  id: number
  authorName: string
}

type ForumPostItemProps = {
  post: ForumPost
  depth: number
  viewer: ForumViewer | null
  onReply: (target: ReplyTarget) => void
  onMutate: () => void
  isThreadLocked: boolean
  resolveReplies: (postId: number) => ForumPost[]
}

function ForumPostItem({ post, depth, viewer, onReply, onMutate, isThreadLocked, resolveReplies }: ForumPostItemProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [editBody, setEditBody] = useState(post.body)
  const [isPending, startTransition] = useTransition()

  const createdAt = ensureDate(post.createdAt)
  const updatedAt = ensureDate(post.updatedAt)
  const isEdited = updatedAt.getTime() - createdAt.getTime() > 60 * 1000

  const canReply = !!viewer && (!isThreadLocked || viewer.isAdmin)
  const canModerate = !!viewer && (viewer.isAdmin || viewer.id === post.authorId)
  const canEdit = canModerate && !post.isDeleted
  const canDelete = canModerate && !post.isDeleted
  const childReplies = resolveReplies(post.id)

  useEffect(() => {
    setEditBody(post.body)
  }, [post.body])

  const handleUpdate = () => {
    if (!canEdit || isPending) return
    startTransition(async () => {
      const result = await updatePost({ postId: post.id, body: editBody })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Post updated.')
      setEditDialogOpen(false)
      onMutate()
    })
  }

  const handleDelete = () => {
    if (!canDelete || isPending) return

    const shouldDelete = window.confirm('Are you sure you want to delete this reply?')
    if (!shouldDelete) {
      return
    }

    startTransition(async () => {
      const result = await deletePost({ postId: post.id })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Post deleted.')
      onMutate()
    })
  }

  const bodyContent = post.isDeleted ? (
    <p className="italic text-muted-foreground">This message has been deleted.</p>
  ) : (
    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{post.body}</p>
  )

  return (
    <div className="space-y-4">
      <div
        className="flex gap-3"
        style={{ marginLeft: depth === 0 ? 0 : depth * 16 }}
      >
        <span className="relative mt-1 inline-flex size-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/30 bg-primary/5">
          <Image
            src={post.authorAvatar}
            alt={post.authorName}
            fill
            sizes="40px"
            className="object-cover"
          />
        </span>
        <div className="flex-1 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{post.authorName}</p>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
            {isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>
          <div className="mt-2">{bodyContent}</div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {canReply && !post.isDeleted && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onReply({ id: post.id, authorName: post.authorName })}>
                Reply
              </Button>
            )}
            {canEdit && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditDialogOpen(true)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            )}
            {isThreadLocked && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Locked</span>}
          </div>
        </div>
      </div>

      {childReplies.length > 0 && (
        <div className="space-y-4">
          {childReplies.map((reply) => (
            <ForumPostItem
              key={reply.id}
              post={reply}
              depth={depth + 1}
              viewer={viewer}
              onReply={onReply}
              onMutate={onMutate}
              isThreadLocked={isThreadLocked}
              resolveReplies={resolveReplies}
            />
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit reply</DialogTitle>
            <DialogDescription>Update your message and save the changes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor={`post-edit-${post.id}`}>
              Message
            </label>
            <textarea
              id={`post-edit-${post.id}`}
              className="min-h-[160px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              disabled={isPending}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUpdate}
              disabled={isPending || !editBody.trim()}
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ThreadDetail({ thread, viewer }: ThreadDetailProps) {
  const router = useRouter()
  const [isThreadDialogOpen, setThreadDialogOpen] = useState(false)
  const [threadTitle, setThreadTitle] = useState(thread.title)
  const [threadBody, setThreadBody] = useState(thread.body)
  const [threadPinned, setThreadPinned] = useState(thread.isPinned)
  const [threadLocked, setThreadLocked] = useState(thread.isLocked)
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [isThreadPending, startThreadTransition] = useTransition()

  useEffect(() => {
    setThreadTitle(thread.title)
    setThreadBody(thread.body)
    setThreadPinned(thread.isPinned)
    setThreadLocked(thread.isLocked)
  }, [thread])

  const canModerateThread = !!viewer && (viewer.isAdmin || viewer.id === thread.authorId)
  const canManageLocks = !!viewer && viewer.isAdmin

  const postsByParent = useMemo(() => {
    const map = new Map<number | null, ForumPost[]>()
    for (const post of thread.posts) {
      const key = post.parentPostId ?? null
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(post)
    }

    for (const [, posts] of map) {
      posts.sort((a, b) => ensureDate(a.createdAt).getTime() - ensureDate(b.createdAt).getTime())
    }

    return map
  }, [thread.posts])

  const rootPosts = postsByParent.get(null) ?? []
  const replyCount = thread.posts.length

  const handleThreadUpdate = () => {
    startThreadTransition(async () => {
      const result = await updateThread(thread.id, {
        title: threadTitle,
        body: threadBody,
        isPinned: canManageLocks ? threadPinned : undefined,
        isLocked: canManageLocks ? threadLocked : undefined,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Thread updated.')
      setThreadDialogOpen(false)
      router.refresh()
    })
  }

  const handleThreadDelete = () => {
    if (!canModerateThread || isThreadPending) return

    const shouldDelete = window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')
    if (!shouldDelete) {
      return
    }

    startThreadTransition(async () => {
      const result = await deleteThread(thread.id)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Thread deleted.')
  router.push('/forum' as Route)
      router.refresh()
    })
  }

  const handleReply = (target: ReplyTarget) => {
    setReplyTarget(target)
  }

  const clearReplyTarget = () => {
    setReplyTarget(null)
  }

  const handleMutate = () => {
    router.refresh()
  }

  const threadCreatedAt = formatRelativeTime(thread.createdAt)
  const lastUpdatedAt = formatRelativeTime(thread.updatedAt)

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border-2 border-primary/10 bg-card p-8 shadow-md">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {threadPinned && (
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Pinned
                </span>
              )}
              {threadLocked && (
                <span className="rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase text-secondary">
                  Locked
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-foreground">{thread.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex size-10 overflow-hidden rounded-full border-2 border-primary/40 bg-primary/5">
                  <Image
                    src={thread.authorAvatar}
                    alt={thread.authorName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <span className="font-semibold text-foreground">{thread.authorName}</span>
              </span>
              <span>Started {threadCreatedAt}</span>
              <span>Updated {lastUpdatedAt}</span>
              <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
          </div>
          {canModerateThread && (
            <div className="flex flex-col items-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setThreadDialogOpen(true)}>
                Edit thread
              </Button>
              <Button type="button" variant="ghost" className="text-destructive" onClick={handleThreadDelete}>
                Delete thread
              </Button>
            </div>
          )}
        </header>
        <Separator className="my-6" />
        <article className="prose max-w-none text-base leading-relaxed text-foreground/90 dark:prose-invert">
          <p className="whitespace-pre-line">{thread.body}</p>
        </article>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Replies</h2>
        <div className="space-y-8">
          {rootPosts.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-card/50 p-8 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </div>
          )}
          {rootPosts.map((post) => (
            <ForumPostItem
              key={post.id}
              post={post}
              depth={0}
              viewer={viewer}
              onReply={handleReply}
              onMutate={handleMutate}
              isThreadLocked={threadLocked}
              resolveReplies={(postId) => postsByParent.get(postId) ?? []}
            />
          ))}
        </div>

        <PostComposer
          threadId={thread.id}
          viewer={viewer}
          isLocked={threadLocked}
          parentPostId={replyTarget?.id ?? null}
          replyingTo={replyTarget}
          onCancelReply={replyTarget ? clearReplyTarget : undefined}
        />
      </section>

      <Dialog open={isThreadDialogOpen} onOpenChange={setThreadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit thread</DialogTitle>
            <DialogDescription>Update your thread details and manage moderation options.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="thread-edit-title">
                Title
              </label>
              <input
                id="thread-edit-title"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={threadTitle}
                onChange={(event) => setThreadTitle(event.target.value)}
                disabled={isThreadPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="thread-edit-body">
                Message
              </label>
              <textarea
                id="thread-edit-body"
                className="min-h-[180px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={threadBody}
                onChange={(event) => setThreadBody(event.target.value)}
                disabled={isThreadPending}
              />
            </div>
            {canManageLocks && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-input bg-muted/30 p-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-muted-foreground"
                    checked={threadPinned}
                    onChange={(event) => setThreadPinned(event.target.checked)}
                    disabled={isThreadPending}
                  />
                  <span>Pin thread</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-input bg-muted/30 p-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-muted-foreground"
                    checked={threadLocked}
                    onChange={(event) => setThreadLocked(event.target.checked)}
                    disabled={isThreadPending}
                  />
                  <span>Lock thread</span>
                </label>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setThreadDialogOpen(false)} disabled={isThreadPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleThreadUpdate}
              disabled={isThreadPending || !threadTitle.trim() || !threadBody.trim()}
            >
              {isThreadPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}