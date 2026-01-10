import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { NextRequest, NextResponse } from 'next/server'

export default withMiddlewareAuthRequired()

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
