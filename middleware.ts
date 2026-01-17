import createMiddleware from 'next-intl/middleware'
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/i18n.config'

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})

// Wrap with Auth0 middleware
export default withMiddlewareAuthRequired((request: NextRequest) => {
  return intlMiddleware(request)
})

export const config = {
  // Protected UI routes - require authentication before accessing
  // Protected API routes - enforce authentication on all API endpoints except webhooks and auth routes
  // Excluded: /api/auth (Auth0 callback), /api/webhooks (external integrations), /api/cron (internal service with secret)
  matcher: [
    // Include all paths for i18n routing
    '/((?!api|_next|_vercel|.*\\..*).*))',
    // Specific Auth0 protected routes
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
