# Security Architecture - BrainBytes

## Overview
This document outlines the authentication and authorization strategy for the BrainBytes application, ensuring all sensitive endpoints are properly protected.

---

## 1. Middleware Authentication (`middleware.ts`)

### Purpose
The middleware enforces authentication at the edge level before requests reach route handlers, providing an additional security layer.

### Protected Routes

#### UI Routes (Protected by Middleware)
- `/learn/*` - Learning dashboard and course materials
- `/leaderboard/*` - User rankings and statistics
- `/quests/*` - Quest management and tracking
- `/shop/*` - Item shop and purchases
- `/lesson/*` - Individual lesson pages

#### API Routes (Protected by Middleware)
- `/api/user/*` - User profile and data endpoints
- `/api/chat/*` - Chatbot and messaging APIs
- `/api/pusher/*` - Real-time synchronization channels

### Excluded Routes (By Design)

#### Authentication Routes (`/api/auth/*`)
- **Reason**: Auth0 callback requires unauthenticated access for the initial login flow
- **Protection**: Secured by Auth0's own callback verification mechanism

#### Webhook Routes (`/api/webhooks/*`)
- **Reason**: External services (Stripe, etc.) cannot authenticate as users
- **Protection**: Each webhook verifies its own signature/secret
  - `Stripe`: Signature verification using `STRIPE_WEBHOOK_SECRET`
  
#### Cron Jobs (`/api/cron/*`)
- **Reason**: Internal scheduled tasks from infrastructure, not user-facing
- **Protection**: Bearer token authentication using `CRON_SECRET`

---

## 2. Route Handler Authentication

### Pattern: User-Facing APIs
All routes requiring user identity use the `requireUser()` function, which:
1. Retrieves the Auth0 session
2. Throws an error if user is not authenticated
3. Returns the user object if authenticated

**Example:**
```typescript
import { requireUser } from '@/lib/auth0'

export async function GET() {
  const user = await requireUser()  // Throws if not authenticated
  // Safe to use user.id, user.email, etc.
}
```

### Route-Specific Protections

#### `/api/user/profile` ✅
- **Authentication**: `requireUser()` on all methods
- **Authorization**: Data scoped to authenticated user
- **Risk Level**: HIGH (personal data)

#### `/api/pusher/auth` ✅
- **Authentication**: `requireUser()` enforced
- **Authorization**: Additional channel-based validation
- **Logic**: 
  ```typescript
  const match = await db.query.challengeMatches.findFirst({
    where: eq(challengeMatches.id, matchId)
  });
  // Only allow if user is part of the match
  if (match.playerOneId !== userId && match.playerTwoId !== userId) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  ```
- **Risk Level**: MEDIUM (real-time channel access)

#### `/api/chat` ⚠️ 
- **Authentication**: Currently missing!
- **Issue**: Anyone can call the chat API
- **Recommendation**: Add `requireUser()` check to log usage and apply rate limiting per user
- **Risk Level**: MEDIUM (API costs, potential abuse)

#### `/api/webhooks/stripe` ✅
- **Authentication**: Not required (external webhook)
- **Authorization**: Signature verification using `STRIPE_WEBHOOK_SECRET`
- **Risk Level**: LOW (signed by Stripe)

#### `/api/cron` ✅
- **Authentication**: Bearer token verification
- **Check**: `authHeader === Bearer ${process.env.CRON_SECRET}`
- **Risk Level**: MEDIUM (infrastructure-level access)

---

## 3. Security Decisions & Rationale

### Decision: Why Middleware Doesn't Protect All API Routes

1. **Specific API Protection**: Not all APIs need user sessions
   - Webhooks require signature verification instead
   - Cron jobs use service tokens
   
2. **Flexibility**: Different authentication schemes for different use cases
   - User APIs: Session-based
   - External webhooks: Signature-based
   - Service APIs: Token-based

3. **Auth0 Integration**: The middleware uses Auth0's edge middleware
   - Perfect for UI routes (automatic redirects)
   - Less suitable for APIs returning JSON errors

### Decision: Why Not All APIs in Middleware Matcher

Including `/api/*` in middleware would affect:
- Auth routes (breaks login flow)
- Webhooks (external services can't authenticate)
- Cron routes (requires different auth scheme)

Therefore, we **explicitly include** only the APIs that need user session authentication.

---

## 4. Implementation Checklist

- [x] Middleware protects UI routes requiring authentication
- [x] Middleware protects user-facing APIs
- [x] `/api/user/*` - Protected with `requireUser()`
- [x] `/api/pusher/*` - Protected with `requireUser()` + channel validation
- [x] `/api/webhooks/*` - Protected with signature verification
- [x] `/api/cron/*` - Protected with secret token
- [ ] `/api/chat` - **TODO**: Add `requireUser()` check for rate limiting
- [x] `/api/auth/*` - Excluded from middleware (Auth0 handles it)
- [x] Documentation complete

---

## 5. Adding Session Protection to New APIs

When adding a new API route that requires user authentication:

```typescript
import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth0'

export async function POST(req: Request) {
  // Add this line - it will throw if not authenticated
  const user = await requireUser()
  
  // Now safe to use user.id, user.email, etc.
  // Also add route to middleware.ts matcher if needed
}
```

Then add the route to `middleware.ts` matcher:
```typescript
matcher: [
  // ... existing routes ...
  '/api/your-new-route/:path*',  // Add here
]
```

---

## 6. Testing Authentication

### Test Unauthenticated Access
```bash
# Should redirect or return 401
curl https://app.local/api/user/profile

# Should work (no auth required)
curl https://app.local/api/auth/[auth0]/callback
curl https://app.local/api/webhooks/stripe
```

### Test Authenticated Access
```bash
# With valid session cookie
curl -b "cookie_value" https://app.local/api/user/profile
```

---

## 7. Environment Variables

Required for authentication and authorization:

```env
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Internal Services
CRON_SECRET=your-secure-random-token

# External Webhooks
STRIPE_WEBHOOK_SECRET=
```

**Never commit these values** - use `.env.local` or GitHub Secrets.

---

## 8. Security Audit Trail

| Date | Change | Risk Level |
|------|--------|-----------|
| 2025-01-02 | Added `/api/user/*`, `/api/chat/*`, `/api/pusher/*` to middleware matcher | Improves security |
| 2025-01-02 | Documented authentication strategy and rationale | Documentation |
| - | TODO: Add session check to `/api/chat` | Future improvement |

---

## 9. Incident Response

If a security vulnerability is discovered:

1. **Immediate**: Disable the affected route
2. **Urgent**: Review logs for unauthorized access
3. **Fix**: Implement patch and test
4. **Deploy**: Follow deployment checklist
5. **Review**: Update this document

---

## References

- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
