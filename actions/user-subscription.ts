"use server";

import { stripe } from "@/lib/stripe";
import { getUserSubscription } from "@/db/queries/userProgress";
import { requireUser } from "@/lib/auth0";

const returnUrl = process.env.NEXT_PUBLIC_APP_URL + "/shop";

// Subscription pricing configuration - use environment variable or default
const SUBSCRIPTION_PRICE_CENTS = parseInt(
  process.env.STRIPE_SUBSCRIPTION_PRICE_CENTS ?? "2000",
  10
);
const SUBSCRIPTION_CURRENCY = process.env.STRIPE_SUBSCRIPTION_CURRENCY ?? "USD";
const SUBSCRIPTION_INTERVAL =
  (process.env.STRIPE_SUBSCRIPTION_INTERVAL as "month" | "year") ?? "month";

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
