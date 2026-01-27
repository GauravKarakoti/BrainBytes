import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { NextRequest, NextResponse } from 'next/server'
import { handleCorsPreFlight, isOriginAllowed } from '@/lib/cors'

// CORS headers to be applied to API responses
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
}

// Middleware function to handle CORS and authentication
function corsMiddleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')

    if (!origin || !isOriginAllowed(origin)) {
      return new NextResponse(null, { status: 403 })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        ...CORS_HEADERS,
      },
    })
  }

  return null
}

// Main middleware
const authMiddleware = withMiddlewareAuthRequired()

export default function middleware(request: NextRequest, event: any) {
  // Apply CORS middleware first
  const corsResponse = corsMiddleware(request)
  if (corsResponse) {
    return corsResponse
  }

  // Then apply auth middleware
  return authMiddleware(request, event)
}

export const config = {
  // Protected UI routes - require authentication before accessing
  // Protected API routes - enforce authentication on all API endpoints except webhooks and auth routes
  // Excluded: /api/auth (Auth0 callback), /api/webhooks (external integrations), /api/cron (internal service with secret)
  matcher: [
    '/learn/:path*',
    '/leaderboard/:path*',
    '/quests/:path*',
    '/shop/:path*',
    '/lesson/:path*',
    '/api/user/:path*',
    '/api/chat/:path*',
    '/api/pusher/:path*',
  ],
}
