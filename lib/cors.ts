/**
 * CORS Configuration and Utilities
 * 
 * Handles Cross-Origin Resource Sharing (CORS) for API endpoints
 * to ensure only trusted domains can access our resources.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Get allowed origins from environment variable or use defaults
 * Format: comma-separated list of origins (e.g., "https://example.com,https://app.example.com")
 */
function getAllowedOrigins(): string[] {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || ''
  
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[]

  if (!allowedOriginsEnv) {
    return defaultOrigins
  }

  return allowedOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  
  const allowedOrigins = getAllowedOrigins()
  
  // Support wildcard domains for development
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true // Only use in development
    if (allowed.includes('*')) {
      // Convert wildcard pattern to regex (e.g., *.example.com -> *.example.com)
      const pattern = allowed.replace(/\*/g, '.*').replace(/\./g, '\\.')
      return new RegExp(`^${pattern}$`).test(origin)
    }
    return origin === allowed
  })
}

/**
 * CORS headers configuration
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'true',
}

/**
 * Handle preflight CORS requests
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')

    if (!isOriginAllowed(origin)) {
      return new NextResponse(null, { status: 403 })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        ...CORS_HEADERS,
      },
    })
  }

  return null
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders<T>(
  response: NextResponse<T>,
  origin: string | null
): NextResponse<T> {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

/**
 * Middleware to apply CORS headers to API responses
 * Usage: Apply to all API routes
 */
export async function corsMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response> | Response
): Promise<Response> {
  // Handle preflight requests
  const preFlightResponse = handleCorsPreFlight(request)
  if (preFlightResponse) {
    return preFlightResponse
  }

  // Process the actual request
  const response = await handler(request)

  // Add CORS headers to response
  const origin = request.headers.get('origin')
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}
