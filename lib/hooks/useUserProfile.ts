'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

export type UserProfileResponse = {
  user: {
    id: string
    name: string
    email: string | null
    picture: string
  }
  progress: {
    userId: string
    userName: string
    userImgSrc: string
    activeCourseId: number | null
    hearts: number
    points: number
    gems: number
    wallet_address: string | null
    level: number
  } | null
}

type UseUserProfileOptions = {
  enabled?: boolean
}

async function requestUserProfile(signal?: AbortSignal): Promise<UserProfileResponse | null> {
  const response = await fetch('/api/user/profile', {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Failed to load profile')
  }

  return (await response.json()) as UserProfileResponse
}

export function useUserProfile(options?: UseUserProfileOptions) {
  const { user, error, isLoading } = useUser()

  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [isProfileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<Error | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const enabled = (options?.enabled ?? true) && !!user && !error

  const fetchProfile = useCallback(async () => {
    if (!enabled) {
      setProfile(null)
      return null
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setProfileLoading(true)
    setProfileError(null)

    try {
      const data = await requestUserProfile(controller.signal)
      setProfile(data)
      return data
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null
      }

      const errorInstance = err instanceof Error ? err : new Error('Failed to load profile')
      setProfileError(errorInstance)
      throw errorInstance
    } finally {
      setProfileLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    fetchProfile().catch(() => null)

    return () => {
      abortRef.current?.abort()
    }
  }, [enabled, fetchProfile])

  const refetchProfile = useCallback(async () => {
    try {
      return await fetchProfile()
    } catch {
      return null
    }
  }, [fetchProfile])

  const invalidateProfile = useCallback(async () => {
    await refetchProfile()
  }, [refetchProfile])

  return {
    authUser: user,
    isAuthLoading: isLoading,
    profile,
    isProfileLoading,
    profileError,
    refetchProfile,
    invalidateProfile,
  }
}
