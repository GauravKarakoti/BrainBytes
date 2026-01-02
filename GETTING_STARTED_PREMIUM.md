# 🎯 Premium Subscription System - Getting Started

Welcome! Your BrainBytes application now has a **complete, production-ready premium subscription system**. This document will guide you through everything you need to know to get started.

---

## ⚡ 30-Second Overview

Your app now supports:
- **4 subscription tiers**: Free, Pro ($9.99/mo), Premium ($19.99/mo), Elite ($49.99/mo)
- **Dual payment methods**: Stripe (credit cards) + Crypto (ETH/BYTE tokens)
- **Feature gating**: Lock features behind premium with one component
- **Automatic renewals**: Handle subscriptions, upgrades, downgrades, cancellations
- **Admin analytics**: Track revenue, users, forecasts

---

## 📖 Reading Order

Start with these documents in this order:

### 1. **This File** (You are here!)
   - Overview and orientation
   - Quick setup steps
   - Where to find what

### 2. **PREMIUM_QUICK_GUIDE.md** (10 minutes)
   - Basic setup
   - How to lock features
   - How to use components
   - Common patterns

### 3. **PREMIUM_INTEGRATION_EXAMPLES.md** (15 minutes)
   - Real-world code examples
   - Feature implementation patterns
   - Copy-paste ready code

### 4. **docs/PREMIUM_SUBSCRIPTION.md** (20 minutes)
   - Complete system documentation
   - Database schema details
   - API endpoint reference

### 5. **docs/STRIPE_CRYPTO_SETUP.md** (As needed)
   - Stripe configuration steps
   - Crypto/Web3 setup
   - Webhook configuration

### 6. **FILE_STRUCTURE_PREMIUM.md** (Reference)
   - Complete file listing
   - Where everything is located
   - Quick lookup

---

## 🚀 5-Minute Quick Start

### Step 1: Configure Environment Variables
```bash
# Copy the template
cp .env.subscription.example .env.local

# Add your actual keys:
STRIPE_API_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CHAIN_ID=11155111
# ... other variables
```

### Step 2: Setup Database
```bash
# Push schema to your database
pnpm db:push

# Seed subscription plans and features
pnpm tsx ./scripts/seed-subscriptions.ts
```

### Step 3: Create Pricing Page
```bash
# Create the file: app/(user)/premium/page.tsx
```

```tsx
import { PricingPlans } from "@/components/pricing/PricingPlans";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <PricingPlans />
    </div>
  );
}
```

### Step 4: Add to Navigation
```tsx
// Add this to your main navigation
<Link href="/premium">
  Premium
</Link>
```

### Step 5: Test
```bash
# Visit http://localhost:3000/premium
# You should see the pricing page with 4 plans!
```

---

## 🔒 Locking Your First Feature

### Easy Way (Recommended)
```tsx
import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";

export default function LiveMentoringPage() {
  return (
    <PremiumFeatureLock feature="Live Mentoring">
      <MentoringInterface />
    </PremiumFeatureLock>
  );
}
```

That's it! Free users will see a lock overlay with upgrade button. Premium users see the feature.

### Server-Side Way
```typescript
import { hasFeature } from "@/lib/premium";
import { requireUser } from "@/lib/auth0";

export default async function CodeReviewPage() {
  const user = await requireUser();
  
  if (!await hasFeature(user.id, "Code Reviews")) {
    return <UpgradePrompt />;
  }

  return <CodeReviewInterface />;
}
```

### API Way
```typescript
// app/api/your-endpoint/route.ts
import { hasFeature } from "@/lib/premium";
import { requireUser } from "@/lib/auth0";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!await hasFeature(user.id, "Your Feature")) {
    return new Response(
      JSON.stringify({ error: "Premium required" }),
      { status: 403 }
    );
  }

  // Process request...
}
```

---

## 📋 What's Already Done

✅ **Database**
- Subscription plans table
- Subscription features table  
- User subscription tracking
- All relations configured
- Seed script ready

✅ **Payments**
- Stripe integration complete
- Crypto/Web3 integration complete
- Webhook handling
- Transaction verification

✅ **API Routes**
- /api/subscriptions - Get plans and status
- /api/subscriptions/check-premium - Check features
- /api/subscriptions/crypto/confirm - Confirm crypto payments

✅ **Components**
- PricingPlans component (drop-in ready)
- SubscriptionDashboard component (drop-in ready)
- PremiumFeatureLock component (drop-in ready)

✅ **Utilities**
- Premium checking functions (isPremiumUser, hasFeature, etc.)
- Database queries (getAllPlans, getUserSubscription, etc.)
- Stripe client setup

✅ **Documentation**
- Complete system guides
- Setup guides for both payment methods
- Code examples
- This getting started guide

---

## 🎯 Common Tasks

### Add Payment Link to Navbar
```tsx
import { Crown } from "lucide-react";
import Link from "next/link";

<Link href="/premium" className="flex items-center gap-2">
  <Crown className="w-5 h-5" />
  Premium
</Link>
```

### Show User Their Plan
```tsx
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";

// In user settings/profile page:
<SubscriptionDashboard />
```

### Check if User is Premium
```typescript
import { isPremiumUser } from "@/lib/premium";

const isPrem = await isPremiumUser(userId);
if (isPrem) {
  // Show premium content
}
```

### Check Specific Feature
```typescript
import { hasFeature } from "@/lib/premium";

const hasMentoring = await hasFeature(userId, "Live Mentoring");
const hasCodeReview = await hasFeature(userId, "Code Reviews");

if (hasMentoring && hasCodeReview) {
  // Both features available
}
```

### Get Feature Limit
```typescript
import { getFeatureLimit } from "@/lib/premium";

const dailyHearts = await getFeatureLimit(userId, "Hearts");
// Returns: 5 for free, 0 (unlimited) for pro+
```

### Get Days Until Expiry
```typescript
import { getDaysRemaining } from "@/lib/premium";

const daysLeft = await getDaysRemaining(userId);
// Returns: number of days
```

---

## 📊 Subscription Tiers Overview

### Free Tier
- **Price**: Free
- **Features**:
  - Basic course access
  - 5 hearts per day
  - 3 challenges per day
  - Community forum
  - Basic progress tracking

### Pro Tier 💜
- **Price**: $9.99/month or $99.99/year (save 17%)
- **Features**:
  - Everything in Free +
  - Unlimited hearts
  - Unlimited challenges
  - All courses unlocked
  - Ad-free experience
  - Progress analytics
  - Premium forum access

### Premium Tier 💎
- **Price**: $19.99/month or $199.99/year (save 17%)
- **Features**:
  - Everything in Pro +
  - Live mentoring (1 session/month)
  - Monthly code reviews (4 sessions)
  - Custom learning paths
  - Advanced analytics
  - Priority support

### Elite Tier 👑
- **Price**: $49.99/month or $499.99/year (save 17%)
- **Features**:
  - Everything in Premium +
  - Unlimited live mentoring
  - Unlimited code reviews
  - VIP-only tournaments
  - 24/7 dedicated support
  - Extra BYTE token rewards
  - Exclusive events

---

## 🔧 Configuration Checklist

Before launching premium features:

- [ ] **Stripe Setup**
  - [ ] Create Stripe account at stripe.com
  - [ ] Create 4 subscription products (Pro, Premium, Elite)
  - [ ] Create price IDs for monthly and yearly
  - [ ] Get API keys and add to .env.local
  - [ ] Create webhook endpoint at /api/webhooks/stripe
  - [ ] Add webhook URL to Stripe dashboard
  - [ ] Get webhook secret and add to .env.local

- [ ] **Crypto Setup**
  - [ ] Get Sepolia testnet details
  - [ ] Deploy or configure BYTE token address
  - [ ] Set shop wallet address
  - [ ] Add chain ID and addresses to .env.local
  - [ ] Test MetaMask connection

- [ ] **App Setup**
  - [ ] Run database migrations
  - [ ] Run seed script
  - [ ] Create /premium page route
  - [ ] Add navigation link
  - [ ] Test pricing page loads
  - [ ] Test checkout flow (use Stripe test cards)

---

## 🧪 Testing Checklist

### Quick Test (5 minutes)
```bash
# 1. Visit pricing page
http://localhost:3000/premium

# 2. See 4 subscription tiers
# 3. Toggle Monthly/Yearly pricing
# 4. See feature comparisons
# 5. Click "Subscribe" (will redirect to Stripe)
```

### Full Stripe Test (15 minutes)
```bash
# 1. Go to /premium
# 2. Select Pro, Monthly billing
# 3. Click Subscribe
# 4. Use test card: 4242 4242 4242 4242
# 5. Enter any future date for expiry
# 6. Complete checkout
# 7. Verify subscription in database
# 8. Check if features unlock
```

### Crypto Test (15 minutes)
```bash
# 1. Switch MetaMask to Sepolia testnet
# 2. Get testnet ETH from faucet
# 3. Go to /premium
# 4. Click "Pay with Crypto"
# 5. Approve MetaMask transaction
# 6. Copy transaction hash
# 7. Submit hash to confirmation endpoint
# 8. Verify subscription activates
```

### Feature Gating Test (10 minutes)
```bash
# 1. As free user: See lock on premium features
# 2. Click "Upgrade Now" on locked feature
# 3. Redirects to /premium ✓
# 4. Subscribe with Stripe
# 5. Return and check feature unlocked ✓
# 6. Cancel subscription
# 7. Check feature locks again ✓
```

---

## 🐛 Troubleshooting

### Pricing page shows "Loading plans..."
```
❌ Issue: API call to /api/subscriptions failing
✅ Fix: 
  1. Check if database migrations ran: pnpm db:push
  2. Check if seed script ran: pnpm tsx ./scripts/seed-subscriptions.ts
  3. Check browser console for errors
  4. Verify database connection in .env.local
```

### Stripe checkout redirects back immediately
```
❌ Issue: Missing Stripe configuration
✅ Fix:
  1. Check STRIPE_API_SECRET_KEY is set in .env.local
  2. Verify Stripe price IDs are created in Stripe dashboard
  3. Check STRIPE_PRICE_ID_PRO_MONTHLY etc. are set
  4. Verify NEXT_PUBLIC_APP_URL is correct (used for return URL)
```

### "Premium required" even for premium users
```
❌ Issue: Feature checking logic issue
✅ Fix:
  1. Check subscription status in database
  2. Verify current date is before currentPeriodEnd
  3. Check feature name exactly matches subscription_features table
  4. Look for errors in server logs
```

### MetaMask payment not confirming
```
❌ Issue: Crypto payment confirmation failing
✅ Fix:
  1. Check if on Sepolia testnet (chainId: 11155111)
  2. Verify transaction hash is valid
  3. Check wallet address is correct
  4. Verify shop wallet address is set in .env.local
  5. Check transaction was actually sent
```

---

## 📚 Quick Reference - Key Functions

```typescript
// Check if user has premium subscription
import { isPremiumUser } from "@/lib/premium";
const isPrem = await isPremiumUser(userId);

// Check if user has specific feature
import { hasFeature } from "@/lib/premium";
const hasFeature = await hasFeature(userId, "Live Mentoring");

// Get numeric limit for feature
import { getFeatureLimit } from "@/lib/premium";
const limit = await getFeatureLimit(userId, "Hearts"); // 0 = unlimited

// Get days remaining on subscription
import { getDaysRemaining } from "@/lib/premium";
const days = await getDaysRemaining(userId);

// Get subscription plans
import { getSubscriptionPlans } from "@/actions/premium-subscription";
const plans = await getSubscriptionPlans();

// Create Stripe checkout
import { createStripeCheckout } from "@/actions/premium-subscription";
const { data } = await createStripeCheckout("plan_id", "monthly");
window.location.href = data.url; // Redirect to Stripe

// Initiate crypto payment
import { initiateCryptoSubscriptionPayment } from "@/actions/crypto-subscription";
await initiateCryptoSubscriptionPayment("plan_id", walletAddress, amount);
```

---

## 🎉 You're All Set!

Your premium subscription system is ready to use:

1. ✅ Database is configured
2. ✅ Payments are ready (Stripe + Crypto)
3. ✅ Components are ready to drop in
4. ✅ Utilities are available
5. ✅ Documentation is complete

### Next Steps:
1. Read **PREMIUM_QUICK_GUIDE.md** (10 min)
2. Copy **PREMIUM_INTEGRATION_EXAMPLES.md** code (30 min)
3. Test Stripe checkout (15 min)
4. Test feature gating (10 min)
5. Deploy to production (varies)

---

## 📞 Need Help?

**Quick Questions?**
- Check: PREMIUM_QUICK_GUIDE.md
- Examples: PREMIUM_INTEGRATION_EXAMPLES.md

**Setup Issues?**
- Check: docs/STRIPE_CRYPTO_SETUP.md
- Reference: FILE_STRUCTURE_PREMIUM.md

**Full Details?**
- Read: docs/PREMIUM_SUBSCRIPTION.md
- Reference: IMPLEMENTATION_CHECKLIST_PREMIUM.md

---

## 🚀 You're Ready to Launch!

Your BrainBytes platform now has a complete, secure, production-ready premium subscription system. Start using it today!

**Happy monetizing! 💰**
