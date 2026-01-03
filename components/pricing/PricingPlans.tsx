"use client";

import { useEffect, useState } from "react";
import { Check, X, Zap, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { getSubscriptionPlans } from "@/actions/premium-subscription";

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular: boolean;
  features: Array<{
    id: string;
    featureName: string;
    featureDescription?: string;
    value: number;
    isUnlimited: boolean;
  }>;
}

export const PricingPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading plans...</div>;
  }

  return (
    <div className="w-full py-12 px-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Choose Your <span className="text-primary">Learning Path</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Unlock premium features to accelerate your DSA mastery
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border transition-all ${
                plan.isPopular
                  ? "border-primary shadow-lg scale-105 md:scale-110 bg-gradient-to-br from-primary/5 to-transparent"
                  : "border-border bg-card"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Crown size={16} /> Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    {plan.isPopular && <Zap className="text-yellow-500" size={20} />}
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      ${((billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "yearly" ? "year" : "month"}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/subscribe?plan=${plan.id}&cycle=${billingCycle}`}
                  className={`w-full py-3 rounded-lg font-semibold text-center transition-all mb-8 block ${
                    plan.isPopular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  Get {plan.name}
                </Link>

                {/* Features List */}
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature.id} className="flex gap-3">
                      {feature.isUnlimited || feature.value > 0 ? (
                        <Check className="text-green-500 flex-shrink-0 mt-1" size={18} />
                      ) : (
                        <X className="text-muted-foreground flex-shrink-0 mt-1" size={18} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{feature.featureName}</p>
                        {feature.featureDescription && (
                          <p className="text-xs text-muted-foreground">{feature.featureDescription}</p>
                        )}
                        {!feature.isUnlimited && feature.value > 0 && (
                          <p className="text-xs text-primary">Up to {feature.value}</p>
                        )}
                        {feature.isUnlimited && (
                          <p className="text-xs text-primary">Unlimited</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-primary" />
            <h3 className="text-xl font-bold">Flexible Payment Options</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">💳</span>
                Stripe (Credit Card)
              </h4>
              <p className="text-muted-foreground">
                Secure payment with Visa, Mastercard, and more. Monthly or yearly billing cycles available.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">🪙</span>
                Cryptocurrency
              </h4>
              <p className="text-muted-foreground">
                Pay with ETH or BYTE tokens on Sepolia testnet. Web3 wallet integration with MetaMask.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
