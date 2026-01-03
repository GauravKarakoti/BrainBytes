# Premium Subscription Implementation Guide

## Quick Start

### 1. Database Setup

```bash
# Run migrations
pnpm db:push

# Seed subscription plans
pnpm tsx ./scripts/seed-subscriptions.ts
```

### 2. Environment Variables

Copy from `.env.example` and fill in:

```env
# Stripe
STRIPE_API_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
# ... other price IDs

# Crypto
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SHOP_WALLET_ADDRESS=0x...
```

See [Stripe & Crypto Setup Guide](./STRIPE_CRYPTO_SETUP.md) for detailed instructions.

### 3. Test Integration

```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000/premium
# Test subscription flow
```

---

## File Structure

### Database
- `db/schema/subscriptionPlans.ts` - Plan and feature definitions
- `db/schema/userSubscription.ts` - User subscription tracking
- `db/queries/subscriptions.ts` - Subscription queries
- `scripts/seed-subscriptions.ts` - Database seeding

### Server Actions
- `actions/premium-subscription.ts` - Stripe payments
- `actions/crypto-subscription.ts` - Crypto payments

### API Routes
- `app/api/subscriptions/route.ts` - Plans and user subscriptions
- `app/api/subscriptions/check-premium.ts` - Feature checks
- `app/api/subscriptions/crypto/confirm/route.ts` - Crypto confirmation
- `app/api/webhooks/stripe/route.ts` - Stripe webhooks

### Components
- `components/pricing/PricingPlans.tsx` - Pricing page
- `components/subscription/SubscriptionDashboard.tsx` - Subscription management
- `components/subscription/PremiumFeatureLock.tsx` - Feature locking

### Utilities
- `lib/premium.ts` - Premium checking functions

### Documentation
- `docs/PREMIUM_SUBSCRIPTION.md` - Full system documentation
- `docs/STRIPE_CRYPTO_SETUP.md` - Payment setup guide

---

## Integration Points

### In Existing User Progress

Update `db/schema/userProgress.ts` relations if needed:
```typescript
export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
  // ... existing relations
  subscription: one(userSubscription, {
    fields: [userProgress.userId],
    references: [userSubscription.userId],
  }),
}));
```

### In Lesson Components

Show premium lock on advanced features:
```tsx
<PremiumFeatureLock feature="Live Mentoring">
  <MentoringBooking />
</PremiumFeatureLock>
```

### In Shop/Shop System

Check premium benefits:
```typescript
const canUseShop = isPremiumUser(userId);
const discount = await hasFeature(userId, "Shop Discount");
```

### In Challenge System

Restrict advanced challenges:
```typescript
if (!isPremium && challenge.difficulty === "hard") {
  return <UpgradePrompt />;
}
```

---

## Usage Examples

### Check Premium Status

```typescript
import { isPremiumUser, hasFeature } from "@/lib/premium";

// In a server action
const isPremium = await isPremiumUser(userId);
if (!isPremium) throw new Error("Premium required");

// Check specific feature
const canMentor = await hasFeature(userId, "Live Mentoring");
```

### In React Components

```typescript
import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";

export function MyFeature() {
  return (
    <PremiumFeatureLock feature="Unlimited Hearts">
      <UnlimitedHearts />
    </PremiumFeatureLock>
  );
}
```

### Create Subscription

```typescript
import { createStripeCheckout } from "@/actions/premium-subscription";

const handleSubscribe = async (planId: string) => {
  const { data } = await createStripeCheckout(planId, "monthly");
  window.location.href = data; // Redirect to Stripe
};
```

### Crypto Payment

```typescript
import { initiateCryptoSubscriptionPayment } from "@/actions/crypto-subscription";

const handleCryptoPayment = async (planId: string, walletAddress: string) => {
  const result = await initiateCryptoSubscriptionPayment(
    planId,
    walletAddress,
    ethers.parseEther("0.05") // Amount in wei
  );
  
  // Show transaction details to user
  // Monitor blockchain
  // Submit tx hash when confirmed
};
```

---

## Database Queries

### Get All Plans
```typescript
import { getAllSubscriptionPlans } from "@/db/queries/subscriptions";

const plans = await getAllSubscriptionPlans();
```

### Get User Subscription
```typescript
import { getUserSubscriptionWithPlan } from "@/db/queries/subscriptions";

const subscription = await getUserSubscriptionWithPlan(userId);
```

### Premium Users (Admin)
```typescript
import { getPremiumUsers, getSubscriptionStats } from "@/db/queries/subscriptions";

const premiumUsers = await getPremiumUsers();
const stats = await getSubscriptionStats();
// { total: 100, active: 45, cancelled: 10, totalMonthlyRevenue: 449.55 }
```

---

## API Endpoints

### Get Plans
```bash
GET /api/subscriptions
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "pro",
      "name": "Pro",
      "monthlyPrice": 999,
      "features": [...]
    }
  ]
}
```

### Check Premium
```bash
POST /api/subscriptions/check-premium
Content-Type: application/json

{
  "userId": "user_123",
  "feature": "Unlimited Hearts"
}
```

Response:
```json
{
  "success": true,
  "isPremium": true,
  "hasFeature": true,
  "planName": "Pro"
}
```

### Confirm Crypto Payment
```bash
POST /api/subscriptions/crypto/confirm
Content-Type: application/json

{
  "userId": "user_123",
  "txnHash": "0x...",
  "planId": "pro"
}
```

---

## Stripe Webhook Events

The system automatically handles:
- ✅ New subscription created
- ✅ Subscription renewed
- ✅ Subscription cancelled
- ✅ Subscription paused
- ✅ Subscription resumed

No manual setup needed for these - handled in `/api/webhooks/stripe/route.ts`

---

## Admin Management

### Seed Default Plans
```bash
pnpm tsx ./scripts/seed-subscriptions.ts
```

Creates 4 plans with 20+ features.

### Modify Plans

Edit `scripts/seed-subscriptions.ts` and re-run, or use admin panel to:
- Add new plans
- Update pricing
- Add/remove features
- Mark popular plans

### View Analytics
```typescript
const stats = await getSubscriptionStats();
console.log(`
  Active Subscriptions: ${stats.active}
  Monthly Revenue: $${stats.totalMonthlyRevenue}
  Cancelled: ${stats.cancelled}
`);
```

---

## Testing

### Test Stripe

1. Use test card: `4242 4242 4242 4242`
2. Visit `/premium` page
3. Select plan
4. Complete payment
5. Check database for activated subscription

### Test Crypto

1. Get Sepolia ETH from faucet
2. Visit `/premium` page
3. Select plan
4. Connect MetaMask to Sepolia
5. Confirm transaction
6. Submit tx hash
7. Check subscription activation

### Test API

```bash
# Check plans
curl http://localhost:3000/api/subscriptions

# Check user premium status
curl -X POST http://localhost:3000/api/subscriptions/check-premium \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","feature":"Unlimited Hearts"}'
```

---

## Monitoring

### Logs to Watch

- `actions/premium-subscription.ts` - Subscription operations
- `app/api/webhooks/stripe/route.ts` - Webhook processing
- `db/queries/subscriptions.ts` - Database queries

### Error Handling

All endpoints return consistent format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Check server logs for full error details.

### Database Integrity

Use Drizzle Studio to inspect:
```bash
pnpm db:studio
```

View:
- `subscription_plans` - All available plans
- `subscription_features` - Plan features
- `user_subscription` - User subscriptions

---

## Performance Considerations

1. **Caching**: Add Redis caching for frequently accessed plans
2. **Database**: Index on `user_subscription.userId` and `user_subscription.status`
3. **API**: Consider pagination for large user lists
4. **Webhooks**: Monitor webhook processing time

---

## Security Checklist

- [ ] API keys in `.env` (not committed)
- [ ] Webhook signatures verified
- [ ] User ID validated server-side
- [ ] Premium checks on protected endpoints
- [ ] Database queries use parameters
- [ ] HTTPS enabled in production
- [ ] Rate limiting on API endpoints
- [ ] Stripe webhook IP allowlist configured

---

## Next Steps

1. ✅ Database setup
2. ✅ Configure Stripe/Crypto
3. ✅ Test payment flows
4. ✅ Deploy to staging
5. ✅ Switch Stripe to live keys
6. ✅ Monitor webhook processing
7. ✅ Add admin analytics dashboard
8. ✅ Customer success tracking

For more details, see [PREMIUM_SUBSCRIPTION.md](./PREMIUM_SUBSCRIPTION.md)
