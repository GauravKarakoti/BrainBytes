# Quick Reference - Premium Subscription

## 🚀 Quick Start (5 minutes)

```bash
# 1. Update database
pnpm db:push

# 2. Seed plans
pnpm tsx ./scripts/seed-subscriptions.ts

# 3. Add environment variables
# Copy from .env.subscription.example to .env

# 4. Test
pnpm dev
# Visit http://localhost:3000/premium
```

## 💳 Check if User is Premium

```typescript
import { isPremiumUser, hasFeature } from "@/lib/premium";

// Simple check
const isPremium = await isPremiumUser(userId);

// Check specific feature
const canMentor = await hasFeature(userId, "Live Mentoring");

// Get days remaining
const days = await getDaysRemaining(userId);
```

## 🎯 Lock Features Behind Premium

```tsx
import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";

<PremiumFeatureLock feature="Unlimited Hearts">
  <YourFeature />
</PremiumFeatureLock>
```

## 📋 Subscription Plans

| Plan | Price | Key Features |
|------|-------|--------------|
| Free | Free | 5 hearts/day, 3 matches/day |
| Pro | $9.99/mo | ∞ hearts, ∞ matches, ad-free |
| Premium | $19.99/mo | + mentoring, code reviews |
| Elite | $49.99/mo | + VIP support, exclusive events |

## 🔗 Important Files

### Database
- `db/schema/subscriptionPlans.ts` - Plan definitions
- `db/schema/userSubscription.ts` - User subscriptions
- `db/queries/subscriptions.ts` - Database queries

### Payment
- `actions/premium-subscription.ts` - Stripe
- `actions/crypto-subscription.ts` - Crypto
- `app/api/webhooks/stripe/route.ts` - Webhooks

### UI
- `components/pricing/PricingPlans.tsx` - Pricing page
- `components/subscription/SubscriptionDashboard.tsx` - Dashboard
- `components/subscription/PremiumFeatureLock.tsx` - Lock features

### Utils
- `lib/premium.ts` - Premium checking

## 🌐 API Endpoints

### Get All Plans
```bash
GET /api/subscriptions
```

### Check Premium Status
```bash
POST /api/subscriptions/check-premium
Body: { "userId": "...", "feature": "..." }
```

### Confirm Crypto Payment
```bash
POST /api/subscriptions/crypto/confirm
Body: { "userId": "...", "txnHash": "...", "planId": "..." }
```

## 💡 Common Tasks

### Show Pricing Page
```tsx
import { PricingPlans } from "@/components/pricing/PricingPlans";

<PricingPlans />
```

### Show Subscription Dashboard
```tsx
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";

<SubscriptionDashboard />
```

### Create Stripe Checkout
```typescript
import { createStripeCheckout } from "@/actions/premium-subscription";

const { data } = await createStripeCheckout("pro", "monthly");
window.location.href = data;
```

### Initiate Crypto Payment
```typescript
import { initiateCryptoSubscriptionPayment } from "@/actions/crypto-subscription";

const result = await initiateCryptoSubscriptionPayment(
  "pro",
  walletAddress,
  amount
);
```

## 📊 Admin Operations

### Get Subscription Stats
```typescript
import { getSubscriptionStats } from "@/db/queries/subscriptions";

const stats = await getSubscriptionStats();
// { active: 45, cancelled: 10, totalMonthlyRevenue: 449.55 }
```

### Get Premium Users
```typescript
import { getPremiumUsers } from "@/db/queries/subscriptions";

const users = await getPremiumUsers();
```

### Get Upcoming Renewals
```typescript
import { getUpcomingRenewals } from "@/db/queries/subscriptions";

const renewals = await getUpcomingRenewals();
```

## 🔒 Security Essentials

✅ Always validate user ID server-side
✅ Use environment variables for API keys
✅ Verify webhook signatures
✅ Check premium status before serving features
✅ Use HTTPS in production

## ⚙️ Configuration

### Stripe
- Get keys from `https://dashboard.stripe.com/apikeys`
- Create products and prices
- Set webhook to `/api/webhooks/stripe`

### Crypto
- Deploy ByteToken to Sepolia
- Configure MetaMask network
- Set RPC endpoint

### Environment Variables
```env
STRIPE_API_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_PRO_MONTHLY=...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=...
```

## 🧪 Testing

### Test Stripe
- Use card: `4242 4242 4242 4242`
- Any future date, any CVC

### Test Crypto
- Get Sepolia ETH from faucet
- Use MetaMask on Sepolia
- Submit tx hash

## 📚 Documentation

- Full docs: `docs/PREMIUM_SUBSCRIPTION.md`
- Setup guide: `docs/STRIPE_CRYPTO_SETUP.md`
- Implementation: `docs/SUBSCRIPTION_IMPLEMENTATION.md`
- Summary: `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md`

## 🆘 Troubleshooting

### Subscription Not Activating
- Check database migrations: `pnpm db:push`
- Verify plans seeded: `pnpm tsx ./scripts/seed-subscriptions.ts`
- Check webhook in Stripe dashboard

### Stripe Payment Fails
- Verify API keys are correct
- Check webhook URL is accessible
- Ensure prices are published

### Crypto Payment Fails
- Verify network is Sepolia (11155111)
- Check wallet has ETH for gas
- Verify contract address deployed

## 📞 Support

For detailed help:
1. Check the relevant documentation file
2. Review server logs
3. Check Stripe dashboard for webhook issues
4. Verify database with `pnpm db:studio`
