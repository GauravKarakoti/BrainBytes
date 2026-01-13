"use client";

import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/actions/premium-subscription";
import { formatSubscriptionStatus, getDaysRemaining } from "@/lib/premium";
import { Calendar, RefreshCw, Trash2, Pause } from "lucide-react";
import Link from "next/link";

export const SubscriptionDashboard = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getCurrentSubscription();
        setSubscription(data);

        if (data) {
          const days = await getDaysRemaining(data.userId);
          setDaysRemaining(days);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading subscription...</div>;
  }

  if (!subscription) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
        <p className="text-muted-foreground mb-4">
          Upgrade to premium to unlock exclusive features and benefits.
        </p>
        <Link href="/premium" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90">
          View Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{subscription.plan?.name} Plan</h3>
            <p className="text-muted-foreground mb-4">{subscription.plan?.description}</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                {formatSubscriptionStatus(subscription.status)}
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={18} />
                <span>
                  {daysRemaining !== null && daysRemaining > 0
                    ? `${daysRemaining} days remaining`
                    : "Subscription expired"}
                </span>
              </p>
              <p className="text-muted-foreground">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Monthly Price</p>
              <p className="text-2xl font-bold">${(subscription.plan?.monthlyPrice / 100).toFixed(2)}</p>
            </div>
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
              <p className="text-lg font-semibold capitalize">{subscription.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      {subscription.plan?.features && subscription.plan.features.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-8">
          <h4 className="text-lg font-bold mb-6">Included Features</h4>
          <div className="grid md:grid-cols-2 gap-6">
            {subscription.plan.features.map((feature: any) => (
              <div key={feature.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <p className="font-semibold">{feature.featureName}</p>
                  {feature.featureDescription && (
                    <p className="text-sm text-muted-foreground">{feature.featureDescription}</p>
                  )}
                  {feature.isUnlimited ? (
                    <p className="text-xs text-primary font-medium">Unlimited access</p>
                  ) : (
                    feature.value > 0 && (
                      <p className="text-xs text-primary font-medium">Up to {feature.value} per month</p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h4 className="text-lg font-bold mb-6">Subscription Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/premium?action=upgrade"
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={18} />
            Upgrade Plan
          </Link>
          <button className="flex items-center gap-2 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors">
            <Pause size={18} />
            Pause Subscription
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-destructive/10 text-destructive rounded-lg font-semibold hover:bg-destructive/20 transition-colors">
            <Trash2 size={18} />
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};
