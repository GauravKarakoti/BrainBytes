// app/components/user/SideMenuUserButton.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import NextLink from 'next/link'
import { Copy, Gauge, Heart, LogOut, Settings, Sparkles, Trophy, Gem } from 'lucide-react'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

const DEFAULT_AVATAR = '/logo.svg'

export function SideMenuUserButton() {
  const {
    authUser,
    isAuthLoading,
    profile,
    isProfileLoading,
    invalidateProfile,
  } = useUserProfile()

  const [isPopoverOpen, setPopoverOpen] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [avatarInput, setAvatarInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const defaultAvatar = profile?.user.picture ?? authUser?.picture ?? DEFAULT_AVATAR
  const storedAvatar = profile?.progress?.userImgSrc ?? defaultAvatar
  const isUsingDefaultAvatar = storedAvatar === defaultAvatar

  const displayAvatar = storedAvatar || defaultAvatar
  const displayName = profile?.progress?.userName ?? profile?.user.name ?? authUser?.name ?? 'Learner'
  const displayEmail = profile?.user.email ?? authUser?.email ?? 'Email not available'

  const stats = useMemo(
    () => [
      { label: 'Level', value: profile?.progress?.level ?? 0, icon: Trophy },
      { label: 'XP', value: profile?.progress?.points ?? 0, icon: Sparkles },
      { label: 'Hearts', value: profile?.progress?.hearts ?? 0, icon: Heart },
      { label: 'Gems', value: profile?.progress?.gems ?? 0, icon: Gem },
    ],
    [profile?.progress?.gems, profile?.progress?.hearts, profile?.progress?.level, profile?.progress?.points]
  )

  useEffect(() => {
    if (!isDialogOpen) return

    const initialName = profile?.progress?.userName ?? profile?.user.name ?? authUser?.name ?? ''
    setDisplayNameInput(initialName)

    if (isUsingDefaultAvatar) {
      setAvatarInput('')
    } else {
      setAvatarInput(profile?.progress?.userImgSrc ?? '')
    }
  }, [isDialogOpen, profile?.progress?.userName, profile?.progress?.userImgSrc, profile?.user.name, authUser?.name, isUsingDefaultAvatar])

  const handleCopyId = async () => {
    const id = profile?.user.id ?? authUser?.sub
    if (!id) return

    try {
      await navigator.clipboard.writeText(id)
      toast.success('User ID copied to clipboard')
    } catch (error) {
      toast.error('Unable to copy ID')
    }
  }

  const handleDialogSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = displayNameInput.trim()

    if (!trimmedName) {
      toast.error('Display name cannot be empty')
      return
    }

    const trimmedAvatar = avatarInput.trim()

    setIsSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          avatarUrl: trimmedAvatar.length > 0 ? trimmedAvatar : null,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to update profile')
      }

      await invalidateProfile()
      toast.success('Profile updated')
      setDialogOpen(false)
      setPopoverOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const triggerClassName = cn(
    buttonVariants({ variant: 'ghost' }),
    'w-full max-w-full h-auto justify-start gap-3 overflow-hidden py-2 px-4 sm:max-lg:w-auto sm:max-lg:px-2'
  )

  if (isAuthLoading || (authUser && isProfileLoading)) {
    return (
      <div className="relative flex h-[60px] items-center sm:max-lg:justify-center">
        <span 
          className="mx-4 size-10 animate-pulse rounded-full bg-loading sm:max-lg:mx-2"
          aria-label="Loading user profile"
          role="status"
        />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="relative flex h-[60px] items-center sm:max-lg:justify-center">
        <a 
          href="/api/auth/login" 
          className={triggerClassName}
          aria-label="Login to BrainBytes"
        >
          Login
        </a>
      </div>
    )
  }

  return (
    <div className="relative flex h-[60px] items-center sm:max-lg:justify-center">
      <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button 
            type="button" 
            className={triggerClassName}
            aria-label={`User menu for ${displayName}`}
            aria-expanded={isPopoverOpen}
            aria-haspopup="dialog"
          >
            <Image
              src={displayAvatar}
              alt={`Profile picture of ${displayName}`}
              width={40}
              height={40}
              className="size-10 rounded-full border border-border object-cover"
            />
            <span className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="max-w-full truncate text-sm font-medium leading-tight">
                {displayName}
              </span>
              {displayEmail !== 'Email not available' ? (
                <span className="max-w-full truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              ) : null}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          align="start" 
          className="w-80 p-0"
          role="dialog"
          aria-label="User profile menu"
        >
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Image
                src={displayAvatar}
                alt={`Profile picture of ${displayName}`}
                width={48}
                height={48}
                className="size-12 rounded-full border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{displayName}</p>
                {displayEmail !== 'Email not available' ? (
                  <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                  role="status"
                  aria-label={`${label}: ${value}`}
                >
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold leading-none">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleCopyId}
              aria-label="Copy user ID to clipboard"
            >
              <Copy className="size-4" aria-hidden="true" />
              Copy user ID
            </Button>
          </div>
          <Separator />
          <div className="space-y-2 p-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setDialogOpen(true)
                setPopoverOpen(false)
              }}
              aria-label="Open profile and preferences settings"
            >
              <Settings className="size-4" aria-hidden="true" />
              Profile & preferences
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2" 
              asChild
              aria-label="Go to dashboard"
            >
              <NextLink href="/learn">
                <Gauge className="size-4" aria-hidden="true" />
                Go to dashboard
              </NextLink>
            </Button>
            <Button 
              variant="danger" 
              className="w-full justify-start gap-2" 
              asChild
              aria-label="Logout from BrainBytes"
            >
              <a href="/api/auth/logout">
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </a>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent 
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle id="dialog-title">Profile & preferences</DialogTitle>
            <DialogDescription id="dialog-description">
              Personalise how your profile appears across BrainBytes.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={handleDialogSubmit}>
            <div className="flex items-center gap-4">
              <Image
                src={avatarInput.trim() ? avatarInput.trim() : displayAvatar}
                alt={displayName}
                width={64}
                height={64}
                className="size-16 rounded-full border border-border object-cover"
              />
              <div className="flex-1 space-y-2">
                <label 
                  htmlFor="display-name-input"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Display name
                </label>
                <Input
                  id="display-name-input"
                  value={displayNameInput}
                  onChange={(event) => setDisplayNameInput(event.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                  required
                  aria-required="true"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label 
                htmlFor="avatar-url-input"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Avatar URL
              </label>
              <Input
                id="avatar-url-input"
                value={avatarInput}
                onChange={(event) => setAvatarInput(event.target.value)}
                placeholder="https://example.com/avatar.png"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep using your Auth0 avatar.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="justify-start"
                onClick={() => setAvatarInput('')}
                disabled={isSaving}
                aria-label="Use default Auth0 avatar"
              >
                Use Auth0 avatar
              </Button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                  aria-label="Cancel profile changes"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSaving}
                  aria-label="Save profile changes"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}