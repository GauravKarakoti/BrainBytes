'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

import { createPost } from '@/actions/forum'
import { Button } from '@/components/ui/button'

import type { ForumViewer } from './utils'

type PostComposerProps = {
  threadId: number
  viewer: ForumViewer | null
  isLocked: boolean
  parentPostId?: number | null
  replyingTo?: { id: number; authorName: string } | null
  onCancelReply?: () => void
}

export function PostComposer({
  threadId,
  viewer,
  isLocked,
  parentPostId = null,
  replyingTo = null,
  onCancelReply,
}: PostComposerProps) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const canBypassLock = viewer?.isAdmin ?? false
  const canSubmit = body.trim().length > 0 && !isPending

  if (!viewer) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Sign in to join the discussion and share your thoughts with the community.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button asChild variant="primary">
            <Link href="/api/auth/login?screen_hint=signup">Create account</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/api/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLocked && !canBypassLock) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-semibold">Thread locked by moderators</p>
        <p className="text-sm text-amber-800 dark:text-amber-200/80">
          New replies are disabled. You can still read existing messages.
        </p>
      </div>
    )
  }

  const handleSubmit = () => {
    if (isPending) return

    startTransition(async () => {
      const result = await createPost({
        threadId,
        parentPostId,
        body,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success('Reply posted.')
      setBody('')
      if (onCancelReply) {
        onCancelReply()
      }
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl border-2 border-primary/10 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 bg-primary/5">
          <Image
            src={viewer.avatar}
            alt={viewer.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </span>
        <div className="flex-grow">
          <p className="text-sm text-muted-foreground">Replying as {viewer.name}</p>
          {replyingTo && (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 font-semibold uppercase tracking-wide">Reply</span>
              <span>to {replyingTo.authorName}</span>
              {onCancelReply && (
                <button
                  type="button"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={onCancelReply}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-semibold" htmlFor={`forum-reply-${parentPostId ?? 'root'}`}>
          Message
        </label>
        <textarea
          id={`forum-reply-${parentPostId ?? 'root'}`}
          className="min-h-[140px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Share your reply with the community."
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        {onCancelReply && (
          <Button type="button" variant="ghost" onClick={onCancelReply} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="button" variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {isPending ? 'Posting…' : 'Post reply'}
        </Button>
      </div>
    </div>
  )
}
