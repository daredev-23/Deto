import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isStripeConfigured } from "../../src/lib/stripe";

describe("Stripe Configuration Detection", () => {
  const originalEnv = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalEnv;
  });

  it("detects placeholder or mock key as unconfigured (Demo mode)", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder_key";
    expect(isStripeConfigured()).toBe(false);

    process.env.STRIPE_SECRET_KEY = "sk_test_mock_secret";
    expect(isStripeConfigured()).toBe(false);

    process.env.STRIPE_SECRET_KEY = "";
    expect(isStripeConfigured()).toBe(false);
  });

  it("detects valid Stripe secret key as configured", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_51Abcdef1234567890abcdef";
    expect(isStripeConfigured()).toBe(true);

    process.env.STRIPE_SECRET_KEY = "sk_live_51Abcdef1234567890abcdef";
    expect(isStripeConfigured()).toBe(true);
  });
});
