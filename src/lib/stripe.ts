import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";

export function isStripeConfigured(): boolean {
  if (!process.env.STRIPE_SECRET_KEY) return false;
  const key = process.env.STRIPE_SECRET_KEY.trim();
  if (
    key === "" ||
    key.includes("placeholder") ||
    key.includes("mock") ||
    key === "sk_test_..."
  ) {
    return false;
  }
  return key.startsWith("sk_test_") || key.startsWith("sk_live_");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-09-30.acacia" as any,
  typescript: true,
});
