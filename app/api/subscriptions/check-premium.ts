import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/subscriptions/check-premium
 * Check if a user has premium subscription and specific features
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, feature } = await req.json();

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

    const isPremium =
      subscription &&
      subscription.isActive &&
      subscription.currentPeriodEnd > new Date();

    const hasFeature =
      isPremium && feature
        ? subscription?.plan?.features.some(
            (f) => f.featureName === feature
          )
        : true;

    return NextResponse.json({
      success: true,
      isPremium,
      hasFeature,
      subscriptionStatus: subscription?.status || "none",
      planName: subscription?.plan?.name || "free",
    });
  } catch (error) {
    console.error("Error checking premium status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check premium status" },
      { status: 500 }
    );
  }
}
