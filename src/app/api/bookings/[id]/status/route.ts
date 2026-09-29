import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const bookingId = params.id;
  const user = session.user as any;

  try {
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    // Verify booking belongs to user's business
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { business: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (booking.business.ownerId !== user.id) {
      return NextResponse.json({ error: "Acceso denegado a este negocio" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
