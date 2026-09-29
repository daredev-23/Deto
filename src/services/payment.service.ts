import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function createStripeCheckoutSession(params: {
  bookingId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { bookingId, successUrl, cancelUrl } = params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      business: true,
    },
  });

  if (!booking) {
    throw new Error("Reserva no encontrada");
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: booking.customerEmail,
    line_items: [
      {
        price_data: {
          currency: (booking.service.currency || "mxn").toLowerCase(),
          product_data: {
            name: `${booking.service.name} - ${booking.business.name}`,
            description: `Cita agendada para el ${booking.startTime.toLocaleString("es-MX")}`,
          },
          unit_amount: booking.totalAmountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      bookingId: booking.id,
      businessId: booking.businessId,
    },
  });

  // Store stripe session ID on booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripeSessionId: session.id,
      paymentMethod: "STRIPE",
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.warn("Stripe webhook: No bookingId in session metadata");
        return { received: true };
      }

      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
        });

        if (!booking) {
          console.warn(`Stripe webhook: Booking ${bookingId} not found`);
          return;
        }

        // Confirm booking and update payment status
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
          },
        });

        // Record payment in Deto
        await tx.payment.upsert({
          where: { bookingId },
          update: {
            status: "SUCCEEDED",
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            stripeCheckoutSessionId: session.id,
            amountInCents: session.amount_total || booking.totalAmountInCents,
          },
          create: {
            bookingId,
            businessId: booking.businessId,
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            stripeCheckoutSessionId: session.id,
            amountInCents: session.amount_total || booking.totalAmountInCents,
            currency: (session.currency || "mxn").toUpperCase(),
            status: "SUCCEEDED",
          },
        });
      });

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment failed for PaymentIntent: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return { received: true };
}
