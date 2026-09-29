import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/services/booking.service";
import { createStripeCheckoutSession } from "@/services/payment.service";
import { isStripeConfigured } from "@/lib/stripe";
import { sendBookingConfirmationEmail } from "@/services/email.service";
import { prisma } from "@/lib/db";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authenticatedUser = session?.user as any;

    const body = await req.json();
    const {
      businessId,
      serviceId,
      staffMemberId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      startTime: startTimeStr,
      paymentMethod = "IN_PERSON",
      successUrl,
      cancelUrl,
    } = body;

    if (!businessId || !serviceId || !customerName || !customerEmail || !startTimeStr) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para la reserva" },
        { status: 400 }
      );
    }

    const startTime = new Date(startTimeStr);
    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ error: "Formato de fecha u hora no válido" }, { status: 400 });
    }

    const customerId = authenticatedUser?.id ? authenticatedUser.id : undefined;

    // Attempt transactional booking creation
    const result = await createBooking({
      businessId,
      serviceId,
      staffMemberId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      startTime,
      paymentMethod,
    });

    if (!result.success) {
      if (result.error === "SLOT_OCCUPIED") {
        return NextResponse.json({ error: result.message }, { status: 409 });
      }
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    let booking = result.booking;

    // If Stripe payment is requested
    if (paymentMethod === "STRIPE") {
      const stripeReady = isStripeConfigured();

      if (!stripeReady) {
        // MODO DEMO / SIMULACIÓN: Stripe no tiene claves reales configuradas
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
            paymentMethod: "STRIPE (Modo Simulación)",
            paymentStatus: "PAID",
            expiresAt: null,
          },
          include: {
            business: true,
            service: true,
            staffMember: true,
          },
        });

        // Enviar notificación por correo
        sendBookingConfirmationEmail(booking).catch((err) =>
          console.error("Error enviando email:", err)
        );

        return NextResponse.json({
          success: true,
          booking,
          isSimulatedPayment: true,
          notice: "Pago confirmado bajo Modo Demo / Simulación de Stripe.",
        });
      }

      // Stripe en modo real con claves válidas
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const finalSuccessUrl =
        successUrl ||
        `${appUrl}/b/${booking.business.slug}/booking-success?bookingId=${booking.id}&payment=success`;
      const finalCancelUrl =
        cancelUrl || `${appUrl}/b/${booking.business.slug}/book/${serviceId}?cancelled=true`;

      try {
        const stripeSession = await createStripeCheckoutSession({
          bookingId: booking.id,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
        });

        return NextResponse.json({
          success: true,
          booking,
          checkoutUrl: stripeSession.url,
        });
      } catch (stripeErr: any) {
        console.error("Error creating Stripe session:", stripeErr);
        return NextResponse.json({
          success: true,
          booking,
          warning: "No se pudo iniciar la pasarela de Stripe. La reserva se mantendrá en espera.",
        });
      }
    }

    // Default flow: confirmed immediately with in-person payment
    sendBookingConfirmationEmail(booking).catch((err) =>
      console.error("Error enviando email de confirmación:", err)
    );

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error("Error in bookings POST API:", error);
    return NextResponse.json({ error: "Error procesando la reserva" }, { status: 500 });
  }
}
