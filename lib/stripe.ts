import Stripe from "stripe";

const secretKey = process.env.STRIPE_API_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_API_SECRET_KEY environment variable is not set.");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

