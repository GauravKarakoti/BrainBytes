/**
 * CORS utility functions for validating allowed origins
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.NEXT_PUBLIC_APP_URL || 'https://brainbytes.vercel.app',
  'https://brainbytes.vercel.app',
]

/**
 * Check if the given origin is allowed for CORS requests
 * @param origin - The origin to check (typically from request headers)
 * @returns boolean - Whether the origin is allowed
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return false
  }

  // Check against allowed origins
  return ALLOWED_ORIGINS.some(allowedOrigin => {
    if (!allowedOrigin) return false
    return origin === allowedOrigin
  })
}

/**
 * Get the CORS headers for a response
 * @param origin - The origin to set in the response
 * @returns object - Headers object with CORS headers
 */
export function getCorsHeaders(origin?: string) {
  const allowOrigin = origin && isOriginAllowed(origin) ? origin : 'http://localhost:3000'

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}
