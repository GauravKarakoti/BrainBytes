import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userSubscription, subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans with features
 */
export async function GET(req: NextRequest) {
  try {
    const plans = await db.query.subscriptionPlans.findMany({
      with: {
        features: true,
      },
      orderBy: (plans, { asc }) => [asc(plans.order)],
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions/user
 * Get current user's subscription status
 * Requires Authentication header with user ID
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const subscription = await db.query.userSubscription.findFirst({
      where: ({ userId: uid }, { eq }) => eq(uid, userId),
      with: {
        plan: {
          with: {
            features: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No subscription found",
      });
    }

    return NextResponse.json({
      success: true,
      data: subscription,
      isActive:
        subscription.isActive &&
        subscription.currentPeriodEnd > new Date(),
    });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
