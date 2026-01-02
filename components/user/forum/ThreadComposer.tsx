'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { createThread } from '@/actions/forum'
import { Button } from '@/components/ui/button'

type ForumComposerUser = {
  id: string
  name: string
  avatar: string
}

type ThreadComposerProps = {
  currentUser: ForumComposerUser | null
}

export function ThreadComposer({ currentUser }: ThreadComposerProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!currentUser) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/40 p-6 text-center">
        <h2 className="text-xl font-bold">Join the conversation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need an account to start a new discussion. Sign in to create threads and reply to the community.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button asChild variant="primary">
            <Link href="/api/auth/login?screen_hint=signup">Sign up</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/api/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setTitle('')
    setBody('')
  }

  const handleSubmit = () => {
    if (isPending) return

    startTransition(async () => {
      const result = await createThread({ title, body })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (result?.threadId) {
        toast.success('Thread created successfully.')
        resetForm()
        router.push(`/forum/${result.threadId}` as Route)
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-2xl border-2 border-primary/10 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 bg-primary/10 text-lg font-bold">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Start a new discussion as</p>
            <p className="text-lg font-semibold">{currentUser.name}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="forum-thread-title">
            Thread title
          </label>
          <input
            id="forum-thread-title"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="What would you like to discuss?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="forum-thread-body">
            Message
          </label>
          <textarea
            id="forum-thread-body"
            className="min-h-[160px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Share your thoughts, questions, or feedback with the BrainBytes community."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            disabled={isPending}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending || (!title.trim() && !body.trim())}
          onClick={resetForm}
        >
          Clear
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? 'Publishing…' : 'Post thread'}
        </Button>
      </div>
    </div>
  )
}
