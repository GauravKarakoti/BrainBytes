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

    const subscriptionItem = subscription.items.data[0];
    if (!subscriptionItem) {
      return new NextResponse("No subscription items found", { status: 400 });
    }

    const currentPeriodEnd = subscriptionItem.current_period_end;

    await db.insert(userSubscription).values({
      userId: session.metadata.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
      isCryptoSubscription: false,
    });
  }

  /* ================= invoice.payment_succeeded ================= */
  if (event.type === "invoice.payment_succeeded") {
  const invoice = event.data.object as Stripe.Invoice;

  const subscriptionId =
    typeof invoice.lines?.data?.[0]?.subscription === "string"
      ? invoice.lines.data[0].subscription
      : invoice.lines?.data?.[0]?.subscription?.id;

  if (!subscriptionId) {
    return new NextResponse("No subscription found on invoice", { status: 400 });
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionItem = subscription.items.data[0];
  if (!subscriptionItem) {
    return new NextResponse("No subscription items found", { status: 400 });
  }

  const currentPeriodEnd = subscriptionItem.current_period_end;

  await db
    .update(userSubscription)
    .set({
      stripePriceId: subscriptionItem.price.id,
      stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
    })
    .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
}

  return new NextResponse(null, { status: 200 });
}
