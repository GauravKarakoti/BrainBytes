"use server";

import { stripe } from "@/lib/stripe";
import { getUserSubscription } from "@/db/queries/userProgress";
import { requireUser } from "@/lib/auth0";

const returnUrl = process.env.NEXT_PUBLIC_APP_URL + "/shop";

// Subscription pricing configuration from environment variables with defaults
const DEFAULT_SUBSCRIPTION_PRICE_CENTS = 2000;
const SUBSCRIPTION_PRICE_CENTS_ENV = process.env.STRIPE_SUBSCRIPTION_PRICE_CENTS;
const SUBSCRIPTION_PRICE_CENTS = (() => {
  if (SUBSCRIPTION_PRICE_CENTS_ENV === undefined) {
    return DEFAULT_SUBSCRIPTION_PRICE_CENTS;
  }

  const parsed = Number.parseInt(SUBSCRIPTION_PRICE_CENTS_ENV, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.warn(
      `Invalid STRIPE_SUBSCRIPTION_PRICE_CENTS value "${SUBSCRIPTION_PRICE_CENTS_ENV}", falling back to default ${DEFAULT_SUBSCRIPTION_PRICE_CENTS}.`
    );
    return DEFAULT_SUBSCRIPTION_PRICE_CENTS;
  }

  return parsed;
})();
const RAW_SUBSCRIPTION_CURRENCY =
  process.env.STRIPE_SUBSCRIPTION_CURRENCY ?? "INR";
const SUBSCRIPTION_CURRENCY = (() => {
  const normalized = RAW_SUBSCRIPTION_CURRENCY.toLowerCase();
  // Basic validation: must be a 3-letter ISO-style currency code
  if (!/^[a-z]{3}$/.test(normalized)) {
    throw new Error(
      `Invalid STRIPE_SUBSCRIPTION_CURRENCY value "${RAW_SUBSCRIPTION_CURRENCY}". ` +
        "Expected a 3-letter ISO currency code (e.g., 'usd')."
    );
  }
  return normalized;
})();
const rawSubscriptionInterval = process.env.STRIPE_SUBSCRIPTION_INTERVAL;
const SUBSCRIPTION_INTERVAL: "month" | "year" =
  rawSubscriptionInterval === "month" || rawSubscriptionInterval === "year"
    ? rawSubscriptionInterval
    : "month";

export const createStripeUrl = async () => {
  const user = await requireUser();
  const userId = user.id;

  if (!user.email) {
    throw new Error("User email is required to create a subscription");
  }

  const userSubscription = await getUserSubscription();

  if (userSubscription && userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { data: stripeSession.url };
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: SUBSCRIPTION_CURRENCY,
          product_data: {
            name: "BrainBytes Pro",
            description: "Unlimited Hearts",
          },
          unit_amount: SUBSCRIPTION_PRICE_CENTS,
          recurring: {
            interval: SUBSCRIPTION_INTERVAL,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  return { data: stripeSession.url };
};
