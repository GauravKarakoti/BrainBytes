# CORS Configuration Guide

## Overview

This document describes the Cross-Origin Resource Sharing (CORS) implementation for the BrainBytes API. CORS is a security mechanism that allows or restricts cross-origin requests to our API endpoints.

## Why CORS?

Proper CORS configuration is essential to:
- **Protect API endpoints** from unauthorized cross-origin requests
- **Allow legitimate clients** (frontend, mobile apps, third-party integrations) to access resources
- **Prevent XSS attacks** by controlling which domains can make requests
- **Enable secure data sharing** while maintaining security boundaries

## Current Implementation

### 1. CORS Utility (`lib/cors.ts`)

The CORS utility provides:
- **`isOriginAllowed(origin)`**: Validates if an origin is in the allowed list
- **`handleCorsPreFlight(request)`**: Handles OPTIONS preflight requests
- **`addCorsHeaders(response, origin)`**: Adds CORS headers to responses
- **`corsMiddleware(request, handler)`**: Middleware wrapper for CORS handling

### 2. Middleware Integration (`middleware.ts`)

The `middleware.ts` file now includes:
- CORS preflight request handling (OPTIONS method)
- Origin validation before applying authentication
- CORS headers added to all API responses

### 3. API Route Updates

Updated API routes include CORS headers:
- `/api/user/profile` (GET, PATCH)
- `/api/chat` (POST)
- `/api/pusher/auth` (POST)

Each route:
1. Gets the origin from the request
2. Validates it using `isOriginAllowed()`
3. Adds appropriate CORS headers to responses

## Configuration

### Environment Variables

Add the following to your `.env` or `.env.local` file:

```env
# Comma-separated list of allowed origins
# If not set, defaults to localhost:3000 and NEXT_PUBLIC_APP_URL
ALLOWED_ORIGINS=https://example.com,https://app.example.com,https://staging.example.com
```

### Default Allowed Origins

If `ALLOWED_ORIGINS` is not set, the following are used by default:
- `http://localhost:3000` (development)
- `http://localhost:3001` (alternative development)
- Value of `NEXT_PUBLIC_APP_URL` environment variable (if set)

### Examples

**Development:**
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Production (single domain):**
```env
ALLOWED_ORIGINS=https://brainstorm.example.com
```

**Production (multiple domains):**
```env
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com,https://staging.example.com
```

**Wildcard domains (use sparingly, development only):**
```env
ALLOWED_ORIGINS=http://localhost:*,*.dev.example.com
```

## CORS Headers

The following headers are set for allowed origins:

```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400 (24 hours)
```

## Request Flow

### Preflight Request (OPTIONS)
```
Client Request:
OPTIONS /api/user/profile HTTP/1.1
Origin: https://example.com

Server Response:
204 No Content
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

### Actual Request (GET/POST/etc)
```
Client Request:
POST /api/user/profile HTTP/1.1
Origin: https://example.com
Content-Type: application/json
Authorization: Bearer <token>

Server Response:
200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true
Content-Type: application/json

{...data...}
```

## Security Considerations

1. **Origin Validation**: Always validate the origin before responding to CORS requests
2. **Credentials**: `Access-Control-Allow-Credentials: true` requires specific origins (no wildcards)
3. **Restricted Methods**: Only allow HTTP methods that are actually used by clients
4. **Restricted Headers**: Limit headers to those required by your API
5. **HTTPS in Production**: Always use HTTPS URLs in production to ensure secure communication

## Testing CORS

### Using curl:
```bash
# Preflight request
curl -i -X OPTIONS \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  https://api.example.com/api/user/profile

# Actual request
curl -i -X GET \
  -H "Origin: https://example.com" \
  -H "Authorization: Bearer <token>" \
  https://api.example.com/api/user/profile
```

### Using browser console:
```javascript
// Fetch with credentials
fetch('https://api.example.com/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  credentials: 'include' // Required for credentials
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('CORS Error:', error));
```

## Troubleshooting

### Error: "Access to XMLHttpRequest blocked by CORS policy"

This occurs when:
1. The origin is not in `ALLOWED_ORIGINS`
2. The HTTP method is not in `Access-Control-Allow-Methods`
3. The header is not in `Access-Control-Allow-Headers`
4. The preflight request failed (check status code)

**Solution:**
- Add your domain to `ALLOWED_ORIGINS`
- Ensure the method is allowed
- Ensure all required headers are listed in `Access-Control-Allow-Headers`
- Check browser console for details

### Error: "Credentials mode is 'include' but Access-Control-Allow-Credentials is missing"

**Solution:**
- Ensure `Access-Control-Allow-Credentials: true` is set
- The origin cannot be a wildcard (`*`) when credentials are used

### OPTIONS request returns 403

**Solution:**
- Check that the origin is allowed
- Ensure the middleware is properly configured
- Check for authentication requirements on preflight requests (they shouldn't have authentication)

## Adding CORS to New API Routes

When creating new API routes that require CORS:

1. Import the CORS utilities:
```typescript
import { NextRequest } from 'next/server'
import { isOriginAllowed } from '@/lib/cors'
```

2. Add the CORS helper function:
```typescript
function addCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  return response
}
```

3. Update your route handler:
```typescript
export async function GET(request: NextRequest) {
  // ... your handler logic ...
  
  let response = NextResponse.json(data)
  const origin = request.headers.get('origin')
  response = addCorsHeaders(response, origin)
  return response
}
```

## References

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Next.js Middleware Documentation](https://nextjs.org/docs/advanced-features/middleware)
- [OWASP CORS Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Origin_Resource_Sharing_CheatSheet.html)
