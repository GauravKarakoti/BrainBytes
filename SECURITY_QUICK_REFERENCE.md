# Security Quick Reference Card

## TL;DR - What Changed

| What | Before | After | Why |
|------|--------|-------|-----|
| **API Auth** | Some routes unprotected | All sensitive routes protected | Security |
| **Chat API** | No user check | Requires `requireUser()` | Prevent abuse |
| **Middleware** | 5 route patterns | 8 route patterns | Enhanced coverage |
| **Documentation** | Minimal | Comprehensive | Knowledge transfer |

---

## For Developers: Adding New APIs

### Step 1: Add User Authentication
```typescript
// ✅ DO THIS
import { requireUser } from '@/lib/auth0'

export async function POST(req: Request) {
  const user = await requireUser()  // Throws if not authenticated
  // Safe to use user.id, user.email
}
```

### Step 2: Update Middleware (if needed)
```typescript
// In middleware.ts
export const config = {
  matcher: [
    // ... existing routes ...
    '/api/your-new-endpoint/:path*',  // ADD HERE if user-facing
  ],
}
```

### Step 3: Test
```bash
# No auth = should fail
curl https://app/api/your-endpoint

# With auth = should work
curl -b "session=..." https://app/api/your-endpoint
```

---

## API Security Status

### ✅ Protected (Both Middleware + Handler)
- `/api/user/*` - User profile
- `/api/chat/*` - Chat API
- `/api/pusher/*` - Real-time

### ✅ Protected (Handler Only)
- `/api/webhooks/stripe` - Signature verified
- `/api/cron/*` - Bearer token

### ✅ Protected (Auth0 Only)
- `/api/auth/[auth0]` - OAuth callback

### 📋 Excluded Routes (By Design)
```
DON'T add to middleware matcher:
├─ /api/auth/* (Auth0 handles it)
├─ /api/webhooks/* (Signature verified)
└─ /api/cron/* (Token verified)
```

---

## Authentication Patterns

### Pattern: User Session Required (Most Common)
```typescript
export async function POST(req: Request) {
  const user = await requireUser()
  // 🎉 User is guaranteed to exist
  console.log(user.id)      // ✅
  console.log(user.email)   // ✅
  console.log(user.name)    // ✅
}
```

### Pattern: Webhook Signature
```typescript
export async function POST(req: Request) {
  const signature = headers().get('Stripe-Signature')
  // Verify with: stripe.webhooks.constructEvent()
  // ❌ No user context needed
}
```

### Pattern: Internal Service Token
```typescript
export async function GET(req: Request) {
  const auth = headers().get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  // ✅ Internal service verified
}
```

---

## Common Mistakes ❌

### ❌ Mistake 1: Forgetting `requireUser()`
```typescript
// BAD - API exposed!
export async function POST(req: Request) {
  const { data } = await req.json()
  // Anyone can call this!
}

// GOOD
export async function POST(req: Request) {
  const user = await requireUser()  // ✅ Add this
  const { data } = await req.json()
}
```

### ❌ Mistake 2: Not Adding to Middleware
```typescript
// API has auth check BUT not in middleware
// ❌ Bad: extra latency for unauthenticated requests
// ✅ Good: middleware rejects before hitting handler

// Add to middleware.ts matcher
matcher: ['/api/my-endpoint/:path*']
```

### ❌ Mistake 3: Exposing Sensitive Data
```typescript
// BAD
return NextResponse.json({
  user,           // ❌ Might contain sensitive data
  apiKey: process.env.API_KEY  // ❌ Leaks secrets!
})

// GOOD
return NextResponse.json({
  userId: user.id,    // ✅ ID only
  name: user.name,    // ✅ Public info
  // Don't return secrets!
})
```

### ❌ Mistake 4: Skipping Authorization
```typescript
// BAD
export async function PUT(req: Request) {
  const user = await requireUser()  // ✅ Authenticated
  const { profileId } = await req.json()
  
  // Update ANY profile!
  await db.update(profiles).set({...})  // ❌ No check
}

// GOOD
export async function PUT(req: Request) {
  const user = await requireUser()
  const { profileId } = await req.json()
  
  // Check user owns this profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId)
  })
  
  if (profile?.userId !== user.id) {
    return new NextResponse('Forbidden', { status: 403 })  // ✅ Check
  }
  
  await db.update(profiles).set({...})
}
```

---

## Debugging Authentication Issues

### Problem: "Unauthorized" on API Call
```
Causes (check in order):
1. ❓ Is middleware protecting this route?
   → Check middleware.ts matcher

2. ❓ Does handler call requireUser()?
   → Add: const user = await requireUser()

3. ❓ Is session valid?
   → Check Auth0 configuration

4. ❓ Are cookies being sent?
   → Verify fetch includes credentials: 'include'
```

### Problem: Webhook Keeps Failing
```
Causes:
1. ❓ Is route in middleware matcher?
   → REMOVE it (webhooks excluded by design)

2. ❓ Is signature valid?
   → Verify STRIPE_WEBHOOK_SECRET in .env

3. ❓ Is body being read twice?
   → Use req.text() once, parse as needed

4. ❓ Endpoint not whitelisted in Stripe?
   → Check Stripe dashboard webhook config
```

---

## Environment Variables Checklist

```bash
# Auth0 - REQUIRED
AUTH0_SECRET=                    # ✅ Check: not empty
AUTH0_BASE_URL=                  # ✅ Check: matches deployment
AUTH0_ISSUER_BASE_URL=           # ✅ Check: valid Auth0 domain
AUTH0_CLIENT_ID=                 # ✅ Check: from Auth0 app
AUTH0_CLIENT_SECRET=             # ✅ Check: from Auth0 app

# Services - REQUIRED IF USED
CRON_SECRET=                     # ✅ Check: secure random token
STRIPE_WEBHOOK_SECRET=           # ✅ Check: from Stripe dashboard

# Never commit these!
.env.local                       # ✅ Add to .gitignore
```

---

## Security Incident Response

### If Unauthorized Access Detected
1. **Immediate**: Check logs for unauthorized requests
2. **Quick**: Identify affected endpoint
3. **Fix**: Add `requireUser()` or update middleware
4. **Test**: Verify endpoint now requires auth
5. **Monitor**: Watch for more attempts
6. **Report**: Update SECURITY_CHECKLIST.md

### Quick Rollback
```bash
# If something breaks:
1. Remove from middleware.ts matcher
2. Keep requireUser() in handler (safety net)
3. Restart deployment
4. Investigate
5. Re-enable after fix
```

---

## HTTP Status Codes Reference

| Code | Meaning | When to Use |
|------|---------|------------|
| `200` | OK | Request succeeded |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing authentication |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Endpoint doesn't exist |
| `500` | Server Error | Something broke |

---

## Testing Checklist

Before deploying new API:
- [ ] Add `requireUser()` check
- [ ] Add to middleware.ts (if user-facing)
- [ ] Test without authentication (should fail)
- [ ] Test with authentication (should succeed)
- [ ] Test authorization (can't access other users' data)
- [ ] Review for hardcoded secrets
- [ ] Document in code comments
- [ ] Update SECURITY_CHECKLIST.md

---

## Documentation Files

Navigate to these for details:

| File | Purpose | Audience |
|------|---------|----------|
| **SECURITY_ARCHITECTURE.md** | Complete security strategy | DevSecOps, Architects |
| **SECURITY_CHECKLIST.md** | Verification & audit | Security team, QA |
| **SECURITY_DIAGRAMS.md** | Visual explanations | Everyone |
| **SECURITY_FIX_SUMMARY.md** | Change summary | Project managers |
| **SECURITY_RESOLUTION.md** | Issue resolution | Developers |
| **This file** | Quick reference | Developers (you!) |

---

## Links & Resources

- Auth0 Docs: https://auth0.com/docs/quickstart/webapp/nextjs
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- OWASP API Security: https://owasp.org/www-project-api-security/

---

## Questions?

1. **"Should I add requireUser() to my endpoint?"**
   - If it accesses user data: YES
   - If it's a webhook: NO
   - If it's internal only: Use bearer token instead

2. **"Should I add it to middleware.ts matcher?"**
   - If it's user-facing API: YES
   - If it's webhook: NO
   - If it's internal: NO

3. **"How do I handle 401 vs 403?"**
   - 401: User not logged in (no session)
   - 403: User logged in but not authorized (no permission)

---

**Last Updated**: 2025-01-02  
**Status**: ✅ All security improvements complete
