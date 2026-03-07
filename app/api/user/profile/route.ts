import { NextResponse, NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { requireUser } from '@/lib/auth0'
import { isOriginAllowed, addCorsHeaders } from '@/lib/cors'


const FALLBACK_AVATAR = '/logo.svg'
const FALLBACK_NAME = 'Learner'

type UserProgressInsert = typeof userProgress.$inferInsert

export async function GET(request: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const progress = await getDb().query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  })

  const response = addCorsHeaders(
    NextResponse.json({
      user: {
        id: user.id,
        name: user.name ?? FALLBACK_NAME,
        email: user.email ?? null,
        picture: user.picture ?? FALLBACK_AVATAR,
      },
      progress,
    }),
    request.headers.get('origin')
  )

  return response
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

export async function PATCH(request: NextRequest) {
  
   const user = await requireUser()
  //  if (process.env.NODE_ENV !== 'development') {
  //     try {
  //       const { limit } = await resolveUserTier(user)
       
  //       if(!user?.id){
  //         let response = new NextResponse('Unauthorized', {status: 401})
  //         response = addCorsHeaders(response, origin)
  //         return response
  //       }
  //       const route = '/api/user/profile'
  //       // const effectiveLimit = Math.min(limit, 10)
  
  //       // rlLimit = effectiveLimit
  //       const rl = await checkRateLimit(user.id, limit, route)
  //       // Attach rate limit headers on responses
  //       if (!rl.allowed) {
  //         let response = new NextResponse('Too Many Requests', {
  //           status: 429,
  //           headers: {
  //             'X-RateLimit-Limit': String(limit),
  //             'X-RateLimit-Remaining': String(rl.remaining),
  //             'X-RateLimit-Reset': String(rl.reset),
  //           },
  //         })
  //         //const origin = req.headers.get('origin')
  //         response = addCorsHeaders(response, origin)
  //         return response
  //       }
  
  //       // Attach rate limit headers for successful attempt (will be returned later)
  //       ;(user as any)._rateLimit = rl
  //       ;(user as any)._rateLimitLimit = limit
  //     } catch (err) {
  //       console.error('[profile] Rate limit check failed:', err)
  //       // Continue without rate limiting on unexpected errors but log it
  //     }
  //   }
  let payload: UpdateProfileBody
  try {
    payload = (await request.json()) as UpdateProfileBody
  } catch (error) {
    const response = addCorsHeaders(
      NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 }),
      request.headers.get('origin')
    )
    return response
  }

  const rawName = typeof payload.name === 'string' ? payload.name.trim() : ''

  if (!rawName) {
    const response = addCorsHeaders(
      NextResponse.json({ error: 'Display name is required.' }, { status: 400 }),
      request.headers.get('origin')
    )
    return response
  }

  let avatarUrl: string | null | undefined
  try {
    avatarUrl = validateAvatarUrl(payload.avatarUrl as string | null | undefined)
  } catch (error) {
    const response = addCorsHeaders(
      NextResponse.json({ error: (error as Error).message }, { status: 400 }),
      request.headers.get('origin')
    )
    return response
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

  const response = addCorsHeaders(
    NextResponse.json({ success: true, progress: updatedProgress }),
    request.headers.get('origin')
  )
  return response
}
