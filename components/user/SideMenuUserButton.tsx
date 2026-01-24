'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()
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
        throw new Error(data.error ?? t('user.profileUpdateFailed'))
      }

      await invalidateProfile()
      toast.success(t('user.profileUpdated'))
      setDialogOpen(false)
      setPopoverOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('user.profileUpdateFailed')
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
        <span className="mx-4 size-10 animate-pulse rounded-full bg-loading sm:max-lg:mx-2" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="relative flex h-[60px] items-center sm:max-lg:justify-center">
        <a href="/api/auth/login" className={triggerClassName}>
          {t('auth.signIn')}
        </a>
      </div>
    )
  }

  return (
    <div className="relative flex h-[60px] items-center sm:max-lg:justify-center">
      <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={triggerClassName}>
            <Image
              src={displayAvatar}
              alt={displayName}
              width={40}
              height={40}
              className="size-10 rounded-full border border-border object-cover"
            />
            <span className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="max-w-full truncate text-sm font-medium leading-tight">
                {displayName}
              </span>
              {displayEmail !== t('user.emailNotAvailable') ? (
                <span className="max-w-full truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              ) : null}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0">
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Image
                src={displayAvatar}
                alt={displayName}
                width={48}
                height={48}
                className="size-12 rounded-full border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{displayName}</p>
                {displayEmail !== t('user.emailNotAvailable') ? (
                  <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
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
            >
              <Copy className="size-4" aria-hidden="true" />
              {t('buttons.copyUserId')}
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
            >
              <Settings className="size-4" aria-hidden="true" />
              {t('user.profile')} & {t('navigation.settings')}
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <NextLink href="/learn">
                <Gauge className="size-4" aria-hidden="true" />
                {t('navigation.dashboard')}
              </NextLink>
            </Button>
            <Button variant="danger" className="w-full justify-start gap-2" asChild>
              <a href="/api/auth/logout">
                <LogOut className="size-4" aria-hidden="true" />
                {t('auth.logout')}
              </a>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('user.updateProfile')}</DialogTitle>
            <DialogDescription>
              {t('user.profile')} & {t('navigation.settings')}
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
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('user.displayName')}
                </label>
                <Input
                  value={displayNameInput}
                  onChange={(event) => setDisplayNameInput(event.target.value)}
                  placeholder={t('user.displayName')}
                  maxLength={60}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('user.avatar')} URL
              </label>
              <Input
                value={avatarInput}
                onChange={(event) => setAvatarInput(event.target.value)}
                placeholder="https://example.com/avatar.png"
              />
              <p className="text-xs text-muted-foreground">
                {t('user.profile')} & preferences - avatar section info message
              </p>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="justify-start"
                onClick={() => setAvatarInput('')}
                disabled={isSaving}
              >
                {t('auth.continueWithAuth0')}
              </Button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? `${t('common.save')}...` : t('common.save')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
