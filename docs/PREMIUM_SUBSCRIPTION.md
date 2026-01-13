# Premium Subscription System

## Overview

BrainBytes now includes a comprehensive premium subscription system that allows users to unlock exclusive features and benefits. The system supports both **Stripe** (credit card payments) and **Cryptocurrency** (blockchain-based payments) for maximum flexibility.

## Features

### Subscription Tiers

#### 🆓 Free Plan
- Basic courses access
- 5 hearts per day
- 3 daily challenge matches
- Community forum access

#### 💜 Pro Plan ($9.99/month or $99.99/year)
- All courses unlocked
- Unlimited hearts per day
- Unlimited challenge matches
- Premium forum access
- Ad-free experience
- Progress analytics

#### 💎 Premium Plan ($19.99/month or $199.99/year)
- All Pro features +
- Live mentoring (1 session/month)
- Monthly code reviews (4 sessions)
- Custom learning paths
- Advanced AI-powered analytics

#### 👑 Elite Plan ($49.99/month or $499.99/year)
- All Premium features +
- Unlimited live mentoring
- Unlimited code reviews
- VIP-only tournaments
- 24/7 dedicated support
- Extra BYTE token rewards

## Payment Methods

### Stripe (Credit Card)

Secure payment processing via Stripe supporting:
- Visa, Mastercard, American Express
- Monthly and yearly billing cycles
- Automatic renewal
- Easy upgrade/downgrade
- Billing portal management

**Setup:**
```env
STRIPE_API_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_...
STRIPE_PRICE_ID_ELITE_MONTHLY=price_...
STRIPE_PRICE_ID_ELITE_YEARLY=price_...
```

### Cryptocurrency (Blockchain)

Pay with Ethereum (ETH) or BYTE tokens on Sepolia testnet.

**Benefits:**
- No credit card required
- Fast transactions
- Lower fees
- Transparent on-chain verification
- Web3 wallet integration (MetaMask)

**Setup:**
```env
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SHOP_WALLET_ADDRESS=0x...
```

## Database Schema

### Subscription Plans
```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  monthlyPrice INTEGER NOT NULL, -- in cents
  yearlyPrice INTEGER NOT NULL,  -- in cents
  stripePriceIdMonthly TEXT,
  stripePriceIdYearly TEXT,
  order INTEGER DEFAULT 0,
  isPopular BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### User Subscriptions
```sql
CREATE TABLE user_subscription (
  userId TEXT PRIMARY KEY,
  planId TEXT REFERENCES subscription_plans(id),
  paymentMethod TEXT DEFAULT 'stripe', -- 'stripe' or 'crypto'
  status TEXT DEFAULT 'active', -- active, cancelled, paused, expired
  isActive BOOLEAN DEFAULT TRUE,
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  -- Stripe fields
  stripeCustomerId TEXT UNIQUE,
  stripeSubscriptionId TEXT UNIQUE,
  stripePriceId TEXT,
  stripeCurrentPeriodEnd TIMESTAMP,
  -- Crypto fields
  txnHash TEXT,
  walletAddress TEXT,
  cancelledAt TIMESTAMP,
  renewalDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Subscription Features
```sql
CREATE TABLE subscription_features (
  id TEXT PRIMARY KEY,
  planId TEXT REFERENCES subscription_plans(id),
  featureName TEXT NOT NULL,
  featureDescription TEXT,
  value INTEGER DEFAULT 0,
  isUnlimited BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## API Routes

### GET `/api/subscriptions`
Get all available subscription plans with features.

**Response:**
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

### POST `/api/subscriptions`
Get current user's subscription status.

**Request:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "isActive": true
}
```

### POST `/api/subscriptions/check-premium`
Check if user has premium subscription and specific features.

**Request:**
```json
{
  "userId": "user_123",
  "feature": "Unlimited Hearts"
}
```

**Response:**
```json
{
  "success": true,
  "isPremium": true,
  "hasFeature": true,
  "planName": "Pro"
}
```

### POST `/api/subscriptions/crypto/confirm`
Confirm a crypto payment and activate subscription.

**Request:**
```json
{
  "userId": "user_123",
  "txnHash": "0x...",
  "planId": "pro"
}
```

## Server Actions

### `createStripeCheckout(planId, billingCycle)`
Create a Stripe checkout session.

```typescript
const { data } = await createStripeCheckout("pro", "monthly");
// data is the checkout URL
```

### `initiateCryptoSubscriptionPayment(planId, walletAddress, amount)`
Initiate a crypto payment.

```typescript
const result = await initiateCryptoSubscriptionPayment(
  "pro",
  "0x...",
  ethers.parseEther("0.05")
);
```

### `updateSubscriptionPlan(newPlanId)`
Upgrade or downgrade subscription.

```typescript
await updateSubscriptionPlan("premium");
```

### `cancelSubscription()`
Cancel the current subscription.

```typescript
await cancelSubscription();
```

### `pauseSubscription()`
Pause the subscription temporarily.

```typescript
await pauseSubscription();
```

### `resumeSubscription()`
Resume a paused subscription.

```typescript
await resumeSubscription();
```

## Utility Functions

### Premium Checking
```typescript
import { isPremiumUser, hasFeature, getFeatureLimit, getDaysRemaining } from "@/lib/premium";

// Check if user is premium
const isPremium = await isPremiumUser(userId);

// Check specific feature
const hasHearts = await hasFeature(userId, "Unlimited Hearts");

// Get feature limit
const limit = await getFeatureLimit(userId, "Monthly Code Reviews");

// Get days remaining
const days = await getDaysRemaining(userId);
```

## UI Components

### `PricingPlans`
Display all subscription plans with features and billing options.

```tsx
import { PricingPlans } from "@/components/pricing/PricingPlans";

export default function PricingPage() {
  return <PricingPlans />;
}
```

### `SubscriptionDashboard`
Show user's current subscription details and management options.

```tsx
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";

export default function SettingsPage() {
  return <SubscriptionDashboard />;
}
```

### `PremiumFeatureLock`
Lock features behind premium subscription with unlock prompts.

```tsx
import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";

<PremiumFeatureLock feature="Unlimited Hearts">
  <YourPremiumFeature />
</PremiumFeatureLock>
```

## Webhooks

### Stripe Webhooks
The system handles the following Stripe events:
- `checkout.session.completed` - New subscription created
- `invoice.payment_succeeded` - Subscription renewed
- `customer.subscription.deleted` - Subscription cancelled
- `customer.subscription.paused` - Subscription paused
- `customer.subscription.resumed` - Subscription resumed

**Webhook URL:** `https://yourdomain.com/api/webhooks/stripe`

## Database Setup

### 1. Run Migrations
```bash
pnpm db:push
```

### 2. Seed Subscription Plans
```bash
pnpm tsx ./scripts/seed-subscriptions.ts
```

This will create:
- 4 subscription plans (Free, Pro, Premium, Elite)
- 20+ subscription features
- Feature mappings for each plan

## Environment Variables

```env
# Stripe
STRIPE_API_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO_MONTHLY=
STRIPE_PRICE_ID_PRO_YEARLY=
STRIPE_PRICE_ID_PREMIUM_MONTHLY=
STRIPE_PRICE_ID_PREMIUM_YEARLY=
STRIPE_PRICE_ID_ELITE_MONTHLY=
STRIPE_PRICE_ID_ELITE_YEARLY=

# Crypto
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SHOP_WALLET_ADDRESS=0x...
```

## Flows

### Stripe Subscription Flow
1. User selects plan and billing cycle
2. Click "Subscribe" → Stripe Checkout
3. Pay with credit card
4. Webhook confirms payment
5. Subscription activated in database
6. User gains access to premium features

### Crypto Payment Flow
1. User selects plan
2. Initiate crypto payment with wallet address
3. MetaMask opens with transaction details
4. Confirm transaction
5. Monitor blockchain confirmation
6. Submit transaction hash
7. API confirms and activates subscription

## Usage Examples

### Checking Premium Status in Components
```tsx
"use client";
import { useEffect, useState } from "react";

export function MyComponent() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const response = await fetch("/api/subscriptions/check-premium", {
        method: "POST",
        body: JSON.stringify({ userId, feature: "Unlimited Hearts" }),
      });
      const data = await response.json();
      setIsPremium(data.isPremium);
    };
    checkStatus();
  }, []);

  return isPremium ? <PremiumFeature /> : <FreeFeature />;
}
```

### Server-Side Checks
```typescript
import { isPremiumUser } from "@/lib/premium";

export async function POST(req) {
  const userId = req.headers.get("x-user-id");
  const isPremium = await isPremiumUser(userId);

  if (!isPremium) {
    return new Response("Premium required", { status: 403 });
  }

  // Process premium-only logic
}
```

## Troubleshooting

### Stripe Issues
- Verify webhook URL in Stripe dashboard
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure price IDs are valid Stripe objects

### Crypto Issues
- Verify wallet address format (0x...)
- Check transaction hash exists on blockchain
- Confirm chain ID matches Sepolia (11155111)

### Database Issues
- Run `pnpm db:push` to sync schema
- Check user subscriptions table has latest columns
- Verify subscription plans are seeded

## Security

- Stripe handles payment security (PCI compliant)
- Crypto transactions verified on-chain
- User IDs validated on server
- Subscription status checked on premium features
- Database queries use parameterized statements
- Webhook signatures verified before processing

## Analytics

```typescript
import { getSubscriptionStats, getPremiumUsers } from "@/db/queries/subscriptions";

const stats = await getSubscriptionStats();
// {
//   total: 100,
//   active: 45,
//   cancelled: 10,
//   paused: 5,
//   totalMonthlyRevenue: 449.55
// }

const premiumUsers = await getPremiumUsers();
```

## Support

For issues or questions:
1. Check environment variables are set correctly
2. Verify database migrations ran successfully
3. Check Stripe API keys and webhook configuration
4. Review browser console for client-side errors
5. Check server logs for API errors
