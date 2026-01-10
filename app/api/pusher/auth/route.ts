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

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const userId = user.id

  const body = await req.formData()
  const socketId = body.get('socket_id') as string
  const channel = body.get('channel_name') as string

  const matchId = channel.replace('private-match-', '');

  if (!matchId) {
      let response = new NextResponse('Forbidden: Invalid channel', { status: 403 })
      const origin = req.headers.get('origin')
      response = addCorsHeaders(response, origin)
      return response
  }

  try {
      const match = await getDb().query.challengeMatches.findFirst({
          where: eq(challengeMatches.id, parseInt(matchId, 10))
      });

    if (!match || (match.playerOneId !== userId && match.playerTwoId !== userId)) {
          let response = new NextResponse('Forbidden: Not part of match', { status: 403 })
          const origin = req.headers.get('origin')
          response = addCorsHeaders(response, origin)
          return response
      }
  } catch (e) {
      let response = new NextResponse('Internal Server Error', { status: 500 })
      const origin = req.headers.get('origin')
      response = addCorsHeaders(response, origin)
      return response
  }

  const userData = {
    user_id: userId,
  }

  const authResponse = getPusher().authorizeChannel(socketId, channel, userData)
  let response = NextResponse.json(authResponse)
  const origin = req.headers.get('origin')
  response = addCorsHeaders(response, origin)
  return response
}