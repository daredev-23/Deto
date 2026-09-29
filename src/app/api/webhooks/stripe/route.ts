import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { processStripeWebhookEvent } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no está configurado");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    await processStripeWebhookEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error(`Error verificando webhook de Stripe: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
