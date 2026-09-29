import { describe, it, expect, vi, beforeEach } from "vitest";
import { processStripeWebhookEvent } from "../../src/services/payment.service";
import { prisma } from "../../src/lib/db";
import Stripe from "stripe";

// Mock Prisma
vi.mock("../../src/lib/db", () => {
  const updateBookingMock = vi.fn();
  const upsertPaymentMock = vi.fn();
  const findUniqueBookingMock = vi.fn();

  return {
    prisma: {
      $transaction: vi.fn(async (callback) => {
        return await callback({
          booking: {
            findUnique: findUniqueBookingMock,
            update: updateBookingMock,
          },
          payment: {
            upsert: upsertPaymentMock,
          },
        });
      }),
      booking: {
        findUnique: findUniqueBookingMock,
        update: updateBookingMock,
      },
      payment: {
        upsert: upsertPaymentMock,
      },
    },
  };
});

describe("Payment Service - Stripe Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles checkout.session.completed and confirms booking and registers payment", async () => {
    const mockBooking = {
      id: "booking-123",
      businessId: "business-456",
      totalAmountInCents: 20000,
    };

    // Setup mocks
    const txBookingFind = vi.fn().mockResolvedValue(mockBooking);
    const txBookingUpdate = vi.fn().mockResolvedValue({ ...mockBooking, status: "CONFIRMED" });
    const txPaymentUpsert = vi.fn().mockResolvedValue({ id: "pay-1" });

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return await callback({
        booking: {
          findUnique: txBookingFind,
          update: txBookingUpdate,
        },
        payment: {
          upsert: txPaymentUpsert,
        },
      });
    });

    const event = {
      id: "evt_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_intent: "pi_test_789",
          amount_total: 20000,
          currency: "mxn",
          metadata: {
            bookingId: "booking-123",
            businessId: "business-456",
          },
        },
      },
    } as unknown as Stripe.Event;

    const result = await processStripeWebhookEvent(event);

    expect(result.received).toBe(true);
    expect(txBookingFind).toHaveBeenCalledWith({ where: { id: "booking-123" } });
    expect(txBookingUpdate).toHaveBeenCalledWith({
      where: { id: "booking-123" },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });
    expect(txPaymentUpsert).toHaveBeenCalledWith({
      where: { bookingId: "booking-123" },
      update: {
        status: "SUCCEEDED",
        stripePaymentIntentId: "pi_test_789",
        stripeCheckoutSessionId: "cs_test_123",
        amountInCents: 20000,
      },
      create: {
        bookingId: "booking-123",
        businessId: "business-456",
        stripePaymentIntentId: "pi_test_789",
        stripeCheckoutSessionId: "cs_test_123",
        amountInCents: 20000,
        currency: "MXN",
        status: "SUCCEEDED",
      },
    });
  });

  it("safely ignores checkout.session.completed without bookingId metadata", async () => {
    const event = {
      id: "evt_no_metadata",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_random",
          metadata: {},
        },
      },
    } as unknown as Stripe.Event;

    const result = await processStripeWebhookEvent(event);
    expect(result.received).toBe(true);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
