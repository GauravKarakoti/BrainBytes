import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export default withMiddlewareAuthRequired({
  publicRoutes: ['/', '/buttons', '/api/webhooks/:path*', '/api/cron/:path*', '/api/auth/:path*'],
})

export const config = {
  matcher: ['/learn/:path*', '/leaderboard/:path*', '/quests/:path*', '/shop/:path*', '/lesson/:path*'],
}
