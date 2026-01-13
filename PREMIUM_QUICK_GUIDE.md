# 🚀 Premium Features Quick Start Guide

## Overview

Your BrainBytes application now has a **complete premium subscription system** with both Stripe and Crypto payment support. This guide shows you how to integrate premium features into your existing code.

---

## 1️⃣ Basic Setup

### Environment Variables
First, ensure these are set in your `.env.local`:

```env
# Stripe
STRIPE_API_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_...
STRIPE_PRICE_ID_ELITE_MONTHLY=price_...
STRIPE_PRICE_ID_ELITE_YEARLY=price_...

# Crypto
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SHOP_WALLET_ADDRESS=0x...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup
```bash
# Push schema to database
pnpm db:push

# Seed subscription plans and features
pnpm tsx ./scripts/seed-subscriptions.ts
```

---

## 2️⃣ Lock Features Behind Premium

### Method 1: Component Wrapper (Easiest)
```tsx
import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";

export default function MentoringPage() {
  return (
    <PremiumFeatureLock feature="Live Mentoring">
      <MentoringInterface />
    </PremiumFeatureLock>
  );
}
```

### Method 2: Server-Side Check
```typescript
import { isPremiumUser, hasFeature } from "@/lib/premium";

export default async function DashboardPage() {
  const isPremium = await isPremiumUser(userId);
  
  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumDashboard />;
}
```

### Method 3: Feature-Specific Check
```typescript
import { hasFeature } from "@/lib/premium";

const canAccessMentoring = await hasFeature(userId, "Live Mentoring");
const canAccessCodeReview = await hasFeature(userId, "Code Reviews");
const canAccessAnalytics = await hasFeature(userId, "Advanced Analytics");

if (canAccessMentoring) {
  // Show mentoring interface
}
```

### Method 4: Get Feature Limits
```typescript
import { getFeatureLimit } from "@/lib/premium";

// Get numeric limits for features
const dailyHearts = await getFeatureLimit(userId, "Hearts");  // 5 for free, unlimited for pro+
const dailyMatches = await getFeatureLimit(userId, "Challenges"); // 3 for free, unlimited for pro+
```

---

## 3️⃣ Create Pricing Page

### Add to Your Navigation
```tsx
// In your navigation component
<Link href="/premium">
  <Crown className="w-4 h-4" />
  Premium
</Link>
```

### Create Page Route
```tsx
// app/(user)/premium/page.tsx
import { PricingPlans } from "@/components/pricing/PricingPlans";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <PricingPlans />
    </div>
  );
}
```

---

## 4️⃣ Display Subscription Status

### In User Dashboard
```tsx
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <SubscriptionDashboard />
    </div>
  );
}
```

---

## 5️⃣ API Usage

### Check Premium Status
```typescript
// Client-side
const response = await fetch("/api/subscriptions/check-premium", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    feature: "Live Mentoring" 
  }),
});

const { isPremium, hasFeature } = await response.json();
```

### Get Subscription Plans
```typescript
// Client or server-side
const response = await fetch("/api/subscriptions");
const { plans, userSubscription } = await response.json();

plans.forEach(plan => {
  console.log(`${plan.name}: $${plan.monthlyPrice/100}/month`);
  console.log(`Features: ${plan.features.map(f => f.featureName).join(", ")}`);
});
```

### Confirm Crypto Payment
```typescript
// After user completes MetaMask transaction
const response = await fetch("/api/subscriptions/crypto/confirm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    txnHash: "0x...",
    walletAddress: "0x...",
    planId: "premium_plan_id"
  }),
});

const { success, message } = await response.json();
```

---

## 6️⃣ Subscription Tiers & Benefits

### Available Plans
```
Free        - Free tier, basic access
Pro         - $9.99/month - Unlimited hearts & challenges, ad-free
Premium     - $19.99/month - Pro + Live mentoring, code reviews
Elite       - $49.99/month - Premium + VIP support, exclusive events
```

### Available Features (to lock)
```
"Unlimited Hearts"
"Unlimited Challenges"
"Ad-Free Experience"
"Live Mentoring"
"Code Reviews"
"Custom Learning Paths"
"Advanced Analytics"
"VIP Support"
"Exclusive Events"
"Bonus BYTE Tokens"
// ...and 10+ more
```

---

## 7️⃣ Admin Features

### Get Analytics
```typescript
import { getSubscriptionAnalytics } from "@/db/queries/subscriptions";

const analytics = await getSubscriptionAnalytics();
console.log(`Total revenue: $${analytics.totalRevenue}`);
console.log(`Active subscribers: ${analytics.activeSubscribers}`);
console.log(`Monthly recurring revenue: $${analytics.mrr}`);
```

### Get User by Tier
```typescript
import { getUsersByTier } from "@/db/queries/subscriptions";

const premiumUsers = await getUsersByTier("premium");
const eliteUsers = await getUsersByTier("elite");
```

---

## 8️⃣ Common Integration Patterns

### Limit Daily Actions
```typescript
import { hasFeature, getFeatureLimit } from "@/lib/premium";

async function useHeart(userId: string) {
  const limit = await getFeatureLimit(userId, "Hearts");
  
  // If unlimited, allow (value = 0 means unlimited)
  if (limit === 0) {
    return true;
  }
  
  // Otherwise check daily usage
  const dailyUsage = await getDailyHeartUsage(userId);
  return dailyUsage < limit;
}
```

### Show Different Content
```tsx
import { hasFeature } from "@/lib/premium";

export default async function CoursesPage() {
  const hasAdvancedAnalytics = await hasFeature(userId, "Advanced Analytics");

  return (
    <div>
      <BasicCourseList />
      
      {hasAdvancedAnalytics && (
        <AdvancedAnalyticsWidget />
      )}
    </div>
  );
}
```

### Upgrade Prompt
```tsx
import { Crown } from "lucide-react";
import Link from "next/link";

export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white text-center">
      <Crown className="w-8 h-8 mx-auto mb-2" />
      <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
      <p className="mb-4">Get {feature} and more exclusive benefits</p>
      <Link 
        href="/premium" 
        className="bg-white text-purple-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100"
      >
        See Plans
      </Link>
    </div>
  );
}
```

---

## 9️⃣ Payment Flow

### Stripe Flow
1. User clicks "Subscribe to Pro"
2. Redirected to Stripe Checkout
3. Enters credit card details
4. Stripe webhook confirms payment
5. Subscription activated in database
6. User gains access to premium features

### Crypto Flow
1. User clicks "Pay with ETH/BYTE"
2. MetaMask popup appears
3. User approves transaction
4. Transaction sent to blockchain
5. User submits transaction hash
6. Backend verifies hash and activates subscription
7. User gains access to premium features

---

## 🔟 Testing

### Test Stripe (Development Mode)
Use these test credit card numbers:
- **4242 4242 4242 4242** - Success
- **4000 0000 0000 0002** - Card Declined
- **4000 0025 0000 3155** - Requires Authentication

### Test Crypto
1. Switch MetaMask to Sepolia testnet
2. Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com)
3. Use the crypto payment flow

### Test Features
```bash
# Check if user is premium
curl -X POST http://localhost:3000/api/subscriptions/check-premium \
  -H "Content-Type: application/json" \
  -d '{"feature": "Live Mentoring"}'

# Get plans
curl http://localhost:3000/api/subscriptions
```

---

## 📚 Documentation References

- **Full System Guide**: [PREMIUM_SUBSCRIPTION.md](docs/PREMIUM_SUBSCRIPTION.md)
- **Payment Setup**: [STRIPE_CRYPTO_SETUP.md](docs/STRIPE_CRYPTO_SETUP.md)
- **Implementation Guide**: [SUBSCRIPTION_IMPLEMENTATION.md](docs/SUBSCRIPTION_IMPLEMENTATION.md)

---

## 🎯 Summary

Your premium subscription system is **ready to use**! Key points:

✅ **Easy Feature Gating** - Use `<PremiumFeatureLock>` or `hasFeature()`
✅ **Multiple Payment Methods** - Stripe or Crypto
✅ **Automatic Management** - Renewals, cancellations, upgrades
✅ **User Dashboard** - Subscription status and management
✅ **Admin Analytics** - Revenue tracking and user segmentation
✅ **Production Ready** - Secure, tested, and documented

**Happy monetizing! 🚀**
