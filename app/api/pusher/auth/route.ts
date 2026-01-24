import { NextResponse, NextRequest } from 'next/server'
import Pusher from 'pusher'
import { getDb } from '@/db/drizzle'
import { challengeMatches } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth0'
import { isOriginAllowed, addCorsHeaders } from '@/lib/cors'

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

/**
 * Helper function to add CORS headers to response
 */
function addCorsHeaders<T>(response: NextResponse<T>, origin: string | null): NextResponse<T> {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  return response
}

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const userId = user.id

  const body = await req.formData()
  const socketId = body.get('socket_id') as string
  const channel = body.get('channel_name') as string

  const matchId = channel.replace('private-match-', '');

  if (!matchId) {
      const response = addCorsHeaders(
          new NextResponse('Forbidden: Invalid channel', { status: 403 }),
          req.headers.get('origin')
      )
      return response
  }

  try {
      const match = await getDb().query.challengeMatches.findFirst({
          where: eq(challengeMatches.id, parseInt(matchId, 10))
      });

    if (!match || (match.playerOneId !== userId && match.playerTwoId !== userId)) {
          const response = addCorsHeaders(
              new NextResponse('Forbidden: Not part of match', { status: 403 }),
              req.headers.get('origin')
          )
          return response
      }
  } catch (e) {
      const response = addCorsHeaders(
          new NextResponse('Internal Server Error', { status: 500 }),
          req.headers.get('origin')
      )
      return response
  }

  const userData = {
    user_id: userId,
  }

  const authResponse = getPusher().authorizeChannel(socketId, channel, userData)
  const response = addCorsHeaders(
      NextResponse.json(authResponse),
      req.headers.get('origin')
  )
  return response
}