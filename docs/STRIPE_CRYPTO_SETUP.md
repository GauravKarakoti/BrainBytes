# Stripe & Crypto Payment Setup Guide

## Stripe Configuration

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete identity verification

### 2. Get API Keys
1. Go to **Dashboard** → **Developers** → **API keys**
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

Add to `.env`:
```env
STRIPE_API_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

Add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Create Subscription Products & Prices

#### Pro Plan
1. Go to **Products** → **Create product**
2. Name: `BrainBytes Pro`
3. Description: `Unlimited hearts, challenges, and ad-free learning`
4. Pricing:
   - Add price: $9.99/month (monthly)
   - Add price: $99.99/year (yearly, save 20%)
5. Save the price IDs

#### Premium Plan
1. Name: `BrainBytes Premium`
2. Description: `Pro benefits + Live mentoring and code reviews`
3. Pricing:
   - Add price: $19.99/month
   - Add price: $199.99/year
4. Save the price IDs

#### Elite Plan
1. Name: `BrainBytes Elite`
2. Description: `Premium benefits + VIP support and exclusive content`
3. Pricing:
   - Add price: $49.99/month
   - Add price: $499.99/year
4. Save the price IDs

Add to `.env`:
```env
# Pro Plan
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...

# Premium Plan
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_...

# Elite Plan
STRIPE_PRICE_ID_ELITE_MONTHLY=price_...
STRIPE_PRICE_ID_ELITE_YEARLY=price_...
```

### 5. Test Stripe Integration

Use test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

Visit `http://localhost:3000/premium` to test the subscription flow.

---

## Cryptocurrency Payment Setup

### 1. Sepolia Testnet Configuration

The system uses Sepolia testnet by default. Ensure your `.env` includes:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### 2. Get Sepolia ETH
1. Visit [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
2. Connect MetaMask
3. Request testnet ETH

### 3. Deploy ByteToken Contract

If not already deployed:

```bash
# Set your private key
export PRIVATE_KEY=your_private_key

# Deploy to Sepolia
pnpm env:load pnpm tsx ./scripts/deploy.ts
```

Save the contract address:
```env
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SHOP_WALLET_ADDRESS=0x...
```

### 4. MetaMask Configuration

For frontend crypto payments:

```typescript
import { useConnect } from 'wagmi';

// Users connect their wallet
const { connect, connectors } = useConnect();

// Check connected wallet
const { address, isConnected } = useAccount();

// Send transaction for subscription
const { data, isLoading, isSuccess, write } = useContractWrite({
  address: BYTE_TOKEN_ADDRESS,
  abi: BYTE_TOKEN_ABI,
  functionName: 'transfer',
  args: [shopWalletAddress, amountInWei],
});
```

### 5. Test Crypto Payments

1. Make sure you have Sepolia ETH in MetaMask
2. Go to `http://localhost:3000/premium`
3. Select a plan and choose "Pay with Crypto"
4. Confirm transaction in MetaMask
5. Wait for confirmation
6. Submit transaction hash

---

## Environment Variables Summary

```env
# Stripe
STRIPE_API_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_...
STRIPE_PRICE_ID_ELITE_MONTHLY=price_...
STRIPE_PRICE_ID_ELITE_YEARLY=price_...

# Cryptocurrency
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_BYTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SHOP_WALLET_ADDRESS=0x...
```

---

## Testing Checklist

- [ ] Stripe test payment succeeds
- [ ] Subscription activates after payment
- [ ] User gains premium features
- [ ] Stripe webhook updates subscription status
- [ ] Stripe billing portal loads
- [ ] MetaMask connects to Sepolia
- [ ] Crypto transaction sends successfully
- [ ] Subscription activates after crypto payment
- [ ] Upgrade/downgrade works
- [ ] Pause/resume works
- [ ] Cancellation works

---

## Troubleshooting

### Stripe Payment Fails
- Verify Stripe API key is correct
- Check webhook URL is publicly accessible
- Ensure prices are published

### Crypto Payment Fails
- Verify network is Sepolia (11155111)
- Check wallet has enough ETH for gas
- Verify contract address is deployed

### Subscription Not Activating
- Check database migrations ran
- Verify subscription plans are seeded
- Check webhook is configured correctly
- Review server logs for errors

---

## Security Notes

1. **Never commit `.env` with real keys**
2. **Use environment variables only**
3. **Validate payments server-side**
4. **Verify webhook signatures**
5. **Use HTTPS in production**
6. **Test with test keys first**
7. **Monitor webhook deliveries in Stripe dashboard**
