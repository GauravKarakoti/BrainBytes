import { NextResponse, NextRequest } from 'next/server'
import Pusher from 'pusher'
import { getDb } from '@/db/drizzle'
import { challengeMatches } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth0'
import { addCorsHeaders } from '@/lib/cors'

let pusher: Pusher;

function getPusher() {
  if (!pusher) {
    if (!process.env.PUSHER_APP_ID || !process.env.NEXT_PUBLIC_PUSHER_APP_KEY || !process.env.PUSHER_SECRET || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      throw new Error('Pusher environment variables not set');
    }
    pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });
  }
  return pusher;
}

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const userId = user.id

  const body = await req.formData()
  const socketId = body.get('socket_id') as string
  const channel = body.get('channel_name') as string

  // 1. Handle user-specific channels
  if (channel.startsWith('private-user-')) {
    const requestedUserId = channel.replace('private-user-', '')
    // Ensure we sanitize the ID exactly like the frontend does
    const sanitizedUserId = userId.replace(/\|/g, '-')

    if (requestedUserId !== sanitizedUserId) {
      return addCorsHeaders(
        new NextResponse('Forbidden: Not your user channel', { status: 403 }),
        req.headers.get('origin')
      )
    }
  } 
  // 2. Handle match-specific channels
  else if (channel.startsWith('private-match-')) {
    const matchId = channel.replace('private-match-', '');

    try {
      const match = await getDb().query.challengeMatches.findFirst({
        where: eq(challengeMatches.id, parseInt(matchId, 10))
      });

      if (!match || (match.playerOneId !== userId && match.playerTwoId !== userId)) {
        return addCorsHeaders(
          new NextResponse('Forbidden: Not part of match', { status: 403 }),
          req.headers.get('origin')
        )
      }
    } catch (e) {
      return addCorsHeaders(
        new NextResponse('Internal Server Error', { status: 500 }),
        req.headers.get('origin')
      )
    }
  } 
  // 3. Fallback for unexpected channels
  else {
    return addCorsHeaders(
      new NextResponse('Forbidden: Invalid channel', { status: 403 }),
      req.headers.get('origin')
    )
  }

  // Authorize the channel if all checks pass
  const userData = {
    user_id: userId,
  }

  const authResponse = getPusher().authorizeChannel(socketId, channel, userData)
  
  return addCorsHeaders(
      NextResponse.json(authResponse),
      req.headers.get('origin')
  )
}