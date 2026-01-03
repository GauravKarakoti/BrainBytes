import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/subscriptions/crypto/confirm
 * Confirm a crypto payment and activate subscription
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, txnHash, planId } = await req.json();

    if (!userId || !txnHash || !planId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate transaction hash format
    if (!txnHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction hash format" },
        { status: 400 }
      );
    }

    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update subscription
    await db
      .update(userSubscription)
      .set({
        txnHash,
        status: "active",
        isActive: true,
        currentPeriodStart: new Date(),
        currentPeriodEnd,
        renewalDate: currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(userSubscription.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Crypto payment confirmed and subscription activated",
    });
  } catch (error) {
    console.error("Error confirming crypto payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
