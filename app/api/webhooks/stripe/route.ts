import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { db } from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  /* ================= checkout.session.completed ================= */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata?.userId || !session.subscription) {
      return new NextResponse("Invalid checkout session", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const currentPeriodEnd =
      (subscription as any).current_period_end as number;

    const planId = session.metadata.planId || "free";
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await db.insert(userSubscription).values({
      userId: session.metadata.userId,
      planId,
      paymentMethod: "stripe",
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: currentPeriodEnd,
      currentPeriodStart: new Date(),
      currentPeriodEnd,
      renewalDate: currentPeriodEnd,
      status: "active",
      isActive: true,
    }).onConflictDoUpdate({
      target: userSubscription.userId,
      set: {
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: currentPeriodEnd,
        currentPeriodEnd,
        status: "active",
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  /* ================= invoice.payment_succeeded ================= */
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await db
      .update(userSubscription)
      .set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: currentPeriodEnd,
        currentPeriodEnd,
        renewalDate: currentPeriodEnd,
        status: "active",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await db
      .update(userSubscription)
      .set({
        status: "cancelled",
        isActive: false,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
  }

  if (event.type === "customer.subscription.paused") {
    const subscription = event.data.object as Stripe.Subscription;

    await db
      .update(userSubscription)
      .set({
        status: "paused",
        updatedAt: new Date(),
      })
      .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
  }

  if (event.type === "customer.subscription.resumed") {
    const subscription = event.data.object as Stripe.Subscription;

    await db
      .update(userSubscription)
      .set({
        status: "active",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const currentPeriodEnd =
    (subscription as unknown as { current_period_end: number })
      .current_period_end;

  await db
    .update(userSubscription)
    .set({
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
    })
    .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
}

  return new NextResponse(null, { status: 200 });
}
