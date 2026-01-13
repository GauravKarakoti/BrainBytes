# Security Details - BrainBytes

## Overview

BrainBytes implements a comprehensive security strategy to protect user data and API endpoints. This document consolidates important security information for developers, security teams, and stakeholders.

**Status**: ✅ **COMPLETE**  
**Last Updated**: 2025-01-02  
**Security Impact**: CRITICAL IMPROVEMENT

---

## Table of Contents

1. [Quick Reference for Developers](#quick-reference-for-developers)
2. [Security Architecture](#security-architecture)
3. [Protected Endpoints](#protected-endpoints)
4. [Implementation Guide](#implementation-guide)
5. [Authentication Patterns](#authentication-patterns)
6. [Request Flow](#request-flow)
7. [Verification Checklist](#verification-checklist)
8. [Common Mistakes](#common-mistakes)
9. [Debugging Guide](#debugging-guide)
10. [Environment Variables](#environment-variables)

---

## Quick Reference for Developers

### What Changed
| What | Before | After | Why |
|------|--------|-------|-----|
| **API Auth** | Some routes unprotected | All sensitive routes protected | Security |
| **Chat API** | No user check | Requires `requireUser()` | Prevent abuse |
| **Middleware** | 5 route patterns | 8 route patterns | Enhanced coverage |
| **Documentation** | Minimal | Comprehensive | Knowledge transfer |

### Adding New APIs (3 Steps)

**Step 1: Add User Authentication**
```typescript
import { requireUser } from '@/lib/auth0'

export async function POST(req: Request) {
  const user = await requireUser()  // Throws if not authenticated
  // Safe to use user.id, user.email
}
```

**Step 2: Update Middleware (if needed)**
```typescript
// In middleware.ts
export const config = {
  matcher: [
    // ... existing routes ...
    '/api/your-endpoint/:path*',  // ADD HERE if user-facing
  ],
}
```

**Step 3: Test**
```bash
# Without auth = should fail
curl https://app/api/your-endpoint

# With auth = should work
curl -b "session=..." https://app/api/your-endpoint
```

---

## Security Architecture

### 1. Middleware Authentication (`middleware.ts`)

The middleware enforces authentication at the edge level before requests reach route handlers.

#### Protected Routes

**UI Routes:**
- `/learn/*` - Learning dashboard and course materials
- `/leaderboard/*` - User rankings and statistics
- `/quests/*` - Quest management and tracking
- `/shop/*` - Item shop and purchases
- `/lesson/*` - Individual lesson pages

**API Routes:**
- `/api/user/*` - User profile and data endpoints
- `/api/chat/*` - Chatbot and messaging APIs
- `/api/pusher/*` - Real-time synchronization channels

#### Excluded Routes (By Design)

**`/api/auth/*` - Authentication Routes**
- Auth0 callback requires unauthenticated access for initial login flow
- Protected by Auth0's own callback verification mechanism
- Risk Level: LOW

**`/api/webhooks/*` - Webhook Routes**
- External services (Stripe, etc.) cannot authenticate as users
- Each webhook verifies its own signature/secret
  - Stripe: Signature verification using `STRIPE_WEBHOOK_SECRET`
- Risk Level: LOW

**`/api/cron/*` - Cron Jobs**
- Internal scheduled tasks from infrastructure, not user-facing
- Protected by bearer token authentication using `CRON_SECRET`
- Risk Level: MEDIUM

### 2. Route Handler Authentication

**Pattern: User-Facing APIs**

All routes requiring user identity use the `requireUser()` function:
1. Retrieves the Auth0 session
2. Throws an error if user is not authenticated
3. Returns the user object if authenticated

```typescript
import { requireUser } from '@/lib/auth0'

export async function GET() {
  const user = await requireUser()  // Throws if not authenticated
  // Safe to use user.id, user.email, etc.
}
```

### 3. Defense in Depth Strategy

```
Layer 1: MIDDLEWARE LEVEL
├─ Next.js Middleware (runs on edge)
├─ Protects: UI routes + specific API routes
└─ Benefit: Rejects unauthenticated requests before reaching handlers

Layer 2: ROUTE HANDLER LEVEL
├─ API Route Handler (server-side)
├─ Protects: Sensitive endpoints with requireUser()
└─ Benefit: Catches any bypass attempts, provides user context

Layer 3: BUSINESS LOGIC LEVEL
├─ Database Queries & Validations
├─ Protects: Ensures user can only access own data
└─ Benefit: Prevents horizontal privilege escalation
```

---

## Protected Endpoints

### API Endpoints Status

| Route | Method | Middleware | Handler | Authorization | Risk Level | Status |
|-------|--------|-----------|---------|----------------|-----------|--------|
| `/api/user/profile` | GET/PUT | ✅ | ✅ `requireUser()` | User-scoped data | HIGH | ✅ Secure |
| `/api/chat` | POST | ✅ | ✅ `requireUser()` | User-based rate limiting | MEDIUM | ✅ Secure |
| `/api/pusher/auth` | POST | ✅ | ✅ `requireUser()` + validation | Channel validation | MEDIUM | ✅ Secure |
| `/api/webhooks/stripe` | POST | ❌ | ✅ Signature | Stripe signature verification | LOW | ✅ Secure |
| `/api/cron/*` | GET | ❌ | ✅ Bearer token | `CRON_SECRET` | MEDIUM | ✅ Secure |
| `/api/auth/[auth0]` | POST | ❌ | ✅ Auth0 | OAuth callback | LOW | ✅ Secure |

---

## Implementation Guide

### Route-Specific Protections

#### `/api/user/profile` ✅
- **Authentication**: `requireUser()` on all methods
- **Authorization**: Data scoped to authenticated user
- **Risk Level**: HIGH (personal data)
- **Example**:
```typescript
export async function GET() {
  const user = await requireUser()
  // Return user's own profile only
  return NextResponse.json(user)
}
```

#### `/api/pusher/auth` ✅
- **Authentication**: `requireUser()` enforced
- **Authorization**: Additional channel-based validation
- **Risk Level**: MEDIUM (real-time channel access)
- **Logic**:
```typescript
const user = await requireUser()
const match = await db.query.challengeMatches.findFirst({
  where: eq(challengeMatches.id, matchId)
})
// Only allow if user is part of the match
if (match.playerOneId !== userId && match.playerTwoId !== userId) {
  return new NextResponse('Forbidden', { status: 403 })
}
```

#### `/api/chat` ✅
- **Authentication**: `requireUser()` check to prevent abuse
- **Authorization**: User-based API usage tracking
- **Risk Level**: MEDIUM (API costs, potential abuse)
- **Benefits**: Enables per-user rate limiting and cost control

#### `/api/webhooks/stripe` ✅
- **Authentication**: Not required (external webhook)
- **Authorization**: Signature verification using `STRIPE_WEBHOOK_SECRET`
- **Risk Level**: LOW (signed by Stripe)

#### `/api/cron/*` ✅
- **Authentication**: Bearer token verification
- **Check**: `authHeader === Bearer ${process.env.CRON_SECRET}`
- **Risk Level**: MEDIUM (infrastructure-level access)

---

## Authentication Patterns

### Pattern 1: User Session Required (Most Common)
```typescript
import { requireUser } from '@/lib/auth0'

export async function POST(req: Request) {
  const user = await requireUser()
  // 🎉 User is guaranteed to exist
  console.log(user.id)      // ✅ Safe
  console.log(user.email)   // ✅ Safe
  console.log(user.name)    // ✅ Safe
  
  // Process user request
  return NextResponse.json({ success: true })
}
```

### Pattern 2: Webhook Signature
```typescript
export async function POST(req: Request) {
  const signature = headers().get('Stripe-Signature')
  const body = await req.text()
  
  // Verify with Stripe SDK
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
  
  // Process webhook event
  return NextResponse.json({ received: true })
}
```

### Pattern 3: Internal Service Token
```typescript
export async function GET(req: Request) {
  const auth = headers().get('authorization')
  
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  // Process internal job
  return NextResponse.json({ processed: true })
}
```

---

## Request Flow

### Protected Route Request Flow
```
┌─────────────────────────────────────────────────┐
│            CLIENT REQUEST                       │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Middleware     │
        │  (edge layer)   │
        └────────┬────────┘
                 │
        ┌────────▼────────────────┐
        │ Has Auth0 session?       │
        │ ├─ YES → Continue        │
        │ └─ NO → Redirect to login│
        └────────┬─────────────────┘
                 │
        ┌────────▼──────────┐
        │ Route Handler     │
        │ Call requireUser()│
        └────────┬──────────┘
                 │
        ┌────────▼────────────────┐
        │ User authenticated?      │
        │ ├─ YES → Continue        │
        │ └─ NO → 401 Unauthorized │
        └────────┬─────────────────┘
                 │
        ┌────────▼──────────────┐
        │ Business Logic        │
        │ (DB queries, etc.)    │
        └────────┬───────────────┘
                 │
        ┌────────▼──────────┐
        │ Return Response   │
        └───────────────────┘
```

### Unprotected Routes (Webhooks/Cron)
```
┌─────────────────────────────────────┐
│      CLIENT REQUEST                 │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │  Specialized    │
        │  Verification   │
        │ (Sig/Token)     │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Valid?         │
        │ ├─ YES → Handler│
        │ └─ NO → Reject  │
        └────────┬────────┘
                 │
        ┌────────▼──────────┐
        │ Return Response   │
        └───────────────────┘
```

---

## Verification Checklist

### ✅ Completed Security Measures

- [x] Middleware protects UI routes requiring authentication
- [x] Middleware protects API routes (`/api/user/*`, `/api/chat/*`, `/api/pusher/*`)
- [x] Protected routes explicitly configured with justification
- [x] `/api/auth/*` excluded - Auth0 callback security
- [x] `/api/webhooks/*` excluded - Signature-based security
- [x] `/api/cron/*` excluded - Token-based security
- [x] User-facing APIs use `requireUser()` for double authentication
- [x] Webhook routes verify service-specific signatures
- [x] Internal service routes verify bearer tokens
- [x] All environment variables documented
- [x] Security audit completed for all endpoints

### Authentication Status Matrix

| Route | Method | Protection | Status |
|-------|--------|-----------|--------|
| `/api/user/profile` | GET | requireUser() | ✅ |
| `/api/user/profile` | PUT | requireUser() | ✅ |
| `/api/chat` | POST | requireUser() | ✅ |
| `/api/pusher/auth` | POST | requireUser() + validation | ✅ |
| `/api/webhooks/stripe` | POST | Signature verification | ✅ |
| `/api/cron` | GET | Bearer token | ✅ |
| `/api/auth/[auth0]` | POST | Auth0 callback | ✅ |

---

## Common Mistakes

### ❌ Mistake 1: Forgetting `requireUser()` Check
```typescript
// DON'T DO THIS
export async function POST(req: Request) {
  const { messages } = await req.json()
  // Anyone can call this! Vulnerable!
}
```

### ✅ Correct Approach
```typescript
// DO THIS
export async function POST(req: Request) {
  const user = await requireUser()  // Check first
  const { messages } = await req.json()
  // Only authenticated users proceed
}
```

### ❌ Mistake 2: Only Checking User, Not Authorization
```typescript
// INCOMPLETE
export async function GET(req: Request, { params }: Props) {
  const user = await requireUser()
  const otherUser = await db.query.users.findFirst({
    where: eq(users.id, params.userId)  // Could be anyone's ID!
  })
  return NextResponse.json(otherUser)  // Privilege escalation!
}
```

### ✅ Correct Approach
```typescript
// CORRECT
export async function GET(req: Request, { params }: Props) {
  const user = await requireUser()
  
  // Only return data for authenticated user
  if (user.id !== params.userId) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })
  return NextResponse.json(userData)
}
```

### ❌ Mistake 3: Adding Route to Middleware Without `requireUser()`
```typescript
// If you add to middleware.ts matcher:
matcher: ['/api/my-new-route/:path*']

// Also add requireUser() in the handler!
export async function POST(req: Request) {
  const user = await requireUser()  // REQUIRED
  // ...
}
```

---

## Debugging Guide

### Issue: "User is not authenticated" Error
```
Symptom: Getting 401/403 on API calls
Solution:
1. Check if you're logged in (visit /learn)
2. Verify route is in middleware matcher OR has requireUser()
3. Check browser cookies: Auth0 session should exist
4. Clear cookies and re-login if expired
```

### Issue: Webhook Signature Verification Fails
```
Symptom: Stripe webhook returns 403
Solution:
1. Verify STRIPE_WEBHOOK_SECRET is set in .env
2. Check webhook body encoding (must be raw string for signing)
3. Ensure Stripe webhook is using correct signing key
4. Check logs for signature mismatch details
```

### Issue: Cron Job Returns 401
```
Symptom: Scheduled job fails with Unauthorized
Solution:
1. Verify CRON_SECRET is set in .env
2. Check Authorization header: must be "Bearer <secret>"
3. Ensure secret matches in .env and job scheduler config
4. Check request URL is correct endpoint
```

### Testing Without Auth
```bash
# To test unauthenticated access:
curl -X POST https://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [...]}'

# Expected: 302 Redirect or 401 Unauthorized
# ✅ This is the correct behavior!

# To test with auth, use authenticated session:
curl -b "auth0_session=your_cookie" ...
```

---

## Environment Variables

### Auth0 Configuration (Required)
```env
AUTH0_SECRET=your-secret-here
AUTH0_BASE_URL=https://app.example.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Internal Services (Required)
```env
CRON_SECRET=your-secure-random-token
```

### External Webhooks (Required)
```env
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### AI Services (Required for Chat API)
```env
GOOGLE_API_KEY=your-google-api-key
```

**Setup Instructions:**
1. Copy `.env.example` to `.env.local`
2. Fill in all required variables from your service providers
3. Restart the development server
4. Verify auth works by visiting `/learn`

---

## Files Modified

### Code Changes
- **[middleware.ts](middleware.ts)**
  - Added `/api/user/:path*` to matcher
  - Added `/api/chat/:path*` to matcher
  - Added `/api/pusher/:path*` to matcher
  - Added documentation comments

- **[app/api/chat/route.ts](app/api/chat/route.ts)**
  - Added `requireUser()` authentication check
  - Added explanatory comment for security

### Documentation Files (Created)
These were consolidated into this file:
- README_SECURITY.md → Documentation index
- SECURITY_ARCHITECTURE.md → Security architecture section
- SECURITY_CHECKLIST.md → Verification checklist section
- SECURITY_DIAGRAMS.md → Request flow section
- SECURITY_FIX_SUMMARY.md → Implementation guide section
- SECURITY_QUICK_REFERENCE.md → Quick reference section
- SECURITY_RESOLUTION.md → Files modified section

---

## Security Improvements

### Before
```
❌ /api/user/profile    → No middleware check
❌ /api/chat            → No middleware check
❌ /api/pusher/auth     → No middleware check
```

### After
```
✅ /api/user/profile    → Middleware + requireUser()
✅ /api/chat            → Middleware + requireUser()
✅ /api/pusher/auth     → Middleware + requireUser() + validation
```

### Impact
| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| **API Protection** | Partial | Complete | HIGH |
| **Rate Limiting** | Impossible | Per-user enabled | MEDIUM |
| **Cost Control** | Unmetered | Trackable | MEDIUM |
| **Developer Guidance** | None | Complete | HIGH |

---

## Next Steps

### For Developers
1. Read this document thoroughly
2. Follow the implementation guide when adding new APIs
3. Always add `requireUser()` for user-facing endpoints
4. Test without auth (should fail) and with auth (should work)

### For Security Team
1. Review authentication status matrix
2. Schedule quarterly security audits
3. Monitor authentication logs for anomalies
4. Track any security incidents

### For DevOps/Deployment
1. Verify all environment variables are configured
2. Test in staging before production deployment
3. Monitor logs for unexpected auth failures
4. Set up alerts for failed authentication attempts

---

## Support

For security questions or concerns:
1. Review the [Quick Reference for Developers](#quick-reference-for-developers) section
2. Check the [Debugging Guide](#debugging-guide) for common issues
3. Contact the security team with details

---

## Sign-off

**Issue**: Consolidate Security Documentation  
**Status**: ✅ COMPLETE  
**Date**: 2025-01-02  

**Consolidation Includes:**
- ✅ Security architecture and design decisions
- ✅ Protected and excluded routes documentation
- ✅ Implementation patterns and examples
- ✅ Verification checklist and audit results
- ✅ Request flow diagrams and visualizations
- ✅ Common mistakes and debugging guide
- ✅ Environment variables and deployment notes
- ✅ Developer guidelines and best practices

**All security documentation consolidated into single source of truth** ✅

---

**Last Updated**: January 2, 2025  
**Version**: 1.0  
**Maintained By**: Security Team
