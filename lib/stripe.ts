import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY || "sk_test_mock_key_for_build", {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

