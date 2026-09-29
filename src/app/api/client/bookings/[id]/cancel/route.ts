import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBookingCancellationEmail } from "@/services/email.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;
  const bookingId = params.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: {
          select: { name: true, slug: true, phone: true, address: true },
        },
        service: {
          select: { name: true, durationMinutes: true, currency: true },
        },
        staffMember: {
          select: { name: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Verificar que la reserva pertenece al usuario autenticado
    if (booking.customerId !== user.id) {
      return NextResponse.json({ error: "No autorizado para cancelar esta cita" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "La cita ya se encuentra cancelada" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // Enviar email de cancelación
    await sendBookingCancellationEmail({
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmountInCents: booking.totalAmountInCents,
      paymentMethod: booking.paymentMethod,
      business: booking.business,
      service: booking.service,
      staffMember: booking.staffMember,
    });

    return NextResponse.json({
      success: true,
      message: "Tu cita ha sido cancelada exitosamente",
      booking: updated,
    });
  } catch (error: any) {
    console.error("Error cancelling client booking:", error);
    return NextResponse.json({ error: "Error al cancelar la cita" }, { status: 500 });
  }
}
