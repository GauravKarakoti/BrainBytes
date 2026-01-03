"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db/drizzle";
import { userSubscription, subscriptionPlans } from "@/db/schema";
import { getUserSubscription } from "@/db/queries/userProgress";
import { requireUser } from "@/lib/auth0";
import { eq } from "drizzle-orm";

const returnUrl = process.env.NEXT_PUBLIC_APP_URL + "/premium";

/**
 * Create a Stripe checkout session for subscription
 * @param planId - The subscription plan ID to subscribe to
 * @param billingCycle - "monthly" or "yearly"
 */
export const createStripeCheckout = async (planId: string, billingCycle: "monthly" | "yearly" = "monthly") => {
  const user = await requireUser();
  const userId = user.id;

  if (!user.email) {
    throw new Error("User email is required to create a subscription");
  }

  // Get the plan details
  const plan = await db.query.subscriptionPlans.findFirst({
    where: ({ id }, { eq }) => eq(id, planId),
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  // Get user's current subscription
  const currentSubscription = await getUserSubscription();

  // If user already has an active subscription, redirect to billing portal
  if (currentSubscription && currentSubscription.isActive && currentSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: currentSubscription.stripeCustomerId,
      return_url: returnUrl,
    });
    return { data: stripeSession.url };
  }

  // Determine which price ID to use
  const priceId = billingCycle === "yearly" 
    ? plan.stripePriceIdYearly 
    : plan.stripePriceIdMonthly;

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for ${plan.name} - ${billingCycle}`);
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planId,
      billingCycle,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  return { data: stripeSession.url };
};

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async () => {
  const plans = await db.query.subscriptionPlans.findMany({
    with: {
      features: true,
    },
    orderBy: (plans, { asc }) => [asc(plans.order)],
  });

  return plans;
};

/**
 * Get current user subscription with plan details
 */
export const getCurrentSubscription = async () => {
  const subscription = await getUserSubscription();
  if (!subscription) return null;

  const plan = await db.query.subscriptionPlans.findFirst({
    where: ({ id }, { eq }) => eq(id, subscription.planId),
    with: {
      features: true,
    },
  });

  return {
    ...subscription,
    plan,
  };
};

/**
 * Upgrade or downgrade subscription plan
 */
export const updateSubscriptionPlan = async (newPlanId: string) => {
  const user = await requireUser();
  const currentSubscription = await getUserSubscription();

  if (!currentSubscription || !currentSubscription.isActive) {
    throw new Error("No active subscription found");
  }

  if (currentSubscription.paymentMethod !== "stripe" || !currentSubscription.stripeSubscriptionId) {
    throw new Error("Only Stripe subscriptions can be updated via this method");
  }

  const newPlan = await db.query.subscriptionPlans.findFirst({
    where: ({ id }, { eq }) => eq(id, newPlanId),
  });

  if (!newPlan) {
    throw new Error("New subscription plan not found");
  }

  // Get the current subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    currentSubscription.stripeSubscriptionId
  );

  // Get the new price ID (use monthly by default)
  const newPriceId = newPlan.stripePriceIdMonthly;

  if (!newPriceId) {
    throw new Error("Price not configured for selected plan");
  }

  // Update the Stripe subscription
  const updatedSubscription = await stripe.subscriptions.update(
    currentSubscription.stripeSubscriptionId,
    {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "create_prorations",
      metadata: {
        userId: user.id,
        planId: newPlanId,
      },
    }
  );

  // Update in database
  await db
    .update(userSubscription)
    .set({
      planId: newPlanId,
      stripePriceId: newPriceId,
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.userId, user.id));

  return { success: true, data: updatedSubscription };
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async () => {
  const user = await requireUser();
  const currentSubscription = await getUserSubscription();

  if (!currentSubscription || !currentSubscription.isActive) {
    throw new Error("No active subscription found");
  }

  if (currentSubscription.paymentMethod === "stripe" && currentSubscription.stripeSubscriptionId) {
    // Cancel in Stripe
    await stripe.subscriptions.del(currentSubscription.stripeSubscriptionId);
  }

  // Update in database
  await db
    .update(userSubscription)
    .set({
      status: "cancelled",
      isActive: false,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.userId, user.id));

  return { success: true };
};

/**
 * Pause subscription
 */
export const pauseSubscription = async () => {
  const user = await requireUser();
  const currentSubscription = await getUserSubscription();

  if (!currentSubscription || !currentSubscription.isActive) {
    throw new Error("No active subscription found");
  }

  if (currentSubscription.paymentMethod === "stripe" && currentSubscription.stripeSubscriptionId) {
    // Pause in Stripe (set pause_at)
    await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
      pause_collection: {
        behavior: "void",
      },
    });
  }

  // Update in database
  await db
    .update(userSubscription)
    .set({
      status: "paused",
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.userId, user.id));

  return { success: true };
};

/**
 * Resume paused subscription
 */
export const resumeSubscription = async () => {
  const user = await requireUser();
  const currentSubscription = await getUserSubscription();

  if (!currentSubscription || currentSubscription.status !== "paused") {
    throw new Error("No paused subscription found");
  }

  if (currentSubscription.paymentMethod === "stripe" && currentSubscription.stripeSubscriptionId) {
    // Resume in Stripe
    await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
      pause_collection: {},
    });
  }

  // Update in database
  await db
    .update(userSubscription)
    .set({
      status: "active",
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(userSubscription.userId, user.id));

  return { success: true };
};
