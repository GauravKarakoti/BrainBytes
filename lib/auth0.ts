import { cache } from 'react'
import { getSession } from '@auth0/nextjs-auth0'

export type AuthUser = {
  id: string
  email: string | null
  name: string
  picture: string
  raw: NonNullable<Awaited<ReturnType<typeof getSession>>['user']>
}

const FALLBACK_AVATAR = '/logo.svg'
const FALLBACK_NAME = 'User'

function mapUser(sessionUser: NonNullable<Awaited<ReturnType<typeof getSession>>['user']>): AuthUser {
  return {
    id: sessionUser.sub,
    email: sessionUser.email ?? null,
    name: sessionUser.name ?? sessionUser.nickname ?? sessionUser.email ?? FALLBACK_NAME,
    picture: sessionUser.picture ?? FALLBACK_AVATAR,
    raw: sessionUser,
  }
}

export const getOptionalUser = cache(async (): Promise<AuthUser | null> => {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  return mapUser(session.user)
})

export async function requireUser(): Promise<AuthUser> {
  const user = await getOptionalUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
