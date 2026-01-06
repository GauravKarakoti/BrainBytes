import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { requireUser } from '@/lib/auth0'

const FALLBACK_AVATAR = '/logo.svg'
const FALLBACK_NAME = 'Learner'

type UserProgressInsert = typeof userProgress.$inferInsert

export async function GET() {
  let user
  try {
    user = await requireUser()
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const progress = await getDb().query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name ?? FALLBACK_NAME,
      email: user.email ?? null,
      picture: user.picture ?? FALLBACK_AVATAR,
    },
    progress,
  })
}

type UpdateProfileBody = {
  name?: unknown
  avatarUrl?: unknown
}

function validateAvatarUrl(value: string | null | undefined) {
  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  try {
    const parsed = new URL(trimmed)
    return parsed.toString()
  } catch (error) {
    throw new Error('Please provide a valid avatar URL.')
  }
}

export async function PATCH(request: Request) {
  const user = await requireUser()

  let payload: UpdateProfileBody
  try {
    payload = (await request.json()) as UpdateProfileBody
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const rawName = typeof payload.name === 'string' ? payload.name.trim() : ''

  if (!rawName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  let avatarUrl: string | null | undefined
  try {
    avatarUrl = validateAvatarUrl(payload.avatarUrl as string | null | undefined)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  const existingProgress = await getDb().query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  })

  if (existingProgress) {
    const updateData = {
      userName: rawName,
    } as Partial<UserProgressInsert>

    if (avatarUrl === null) {
      updateData.userImgSrc = user.picture ?? existingProgress.userImgSrc ?? FALLBACK_AVATAR
    } else if (typeof avatarUrl === 'string') {
      updateData.userImgSrc = avatarUrl
    }

    await getDb().update(userProgress).set(updateData).where(eq(userProgress.userId, user.id))
  } else {
    const computedAvatar =
      typeof avatarUrl === 'string' ? avatarUrl : user.picture ?? FALLBACK_AVATAR

    await getDb().insert(userProgress).values({
      userId: user.id,
      userName: rawName || FALLBACK_NAME,
      userImgSrc: computedAvatar,
    })
  }

  revalidateTag('get_user_progress')
  revalidateTag(`get_user_progress::${user.id}`)

  const updatedProgress = await getDb().query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  })

  return NextResponse.json({ success: true, progress: updatedProgress })
}
