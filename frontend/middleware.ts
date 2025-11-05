import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isPublicRoute = createRouteMatcher(['/', '/buttons'])

export default clerkMiddleware(
  (auth, req) => {
    if (isPublicRoute(req)) return

    if (isAdminRoute(req)) auth().protect({ role: 'org:admin' })

    auth().protect()
  },
  { debug: process.env.NODE_ENV !== 'production' }
)

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
