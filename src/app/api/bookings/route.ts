import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/services/booking.service";
import { sendBookingConfirmationEmail } from "@/services/email.service";
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

    // Create booking atomically
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
      paymentMethod: "IN_PERSON",
    });

    if (!result.success) {
      if (result.error === "SLOT_OCCUPIED") {
        return NextResponse.json({ error: result.message }, { status: 409 });
      }
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    const booking = result.booking;

    // Send confirmation email asynchronously (with console fallback)
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
