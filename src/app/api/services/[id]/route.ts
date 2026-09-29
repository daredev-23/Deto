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

  const user = session.user as any;
  const serviceId = params.id;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service || service.business.ownerId !== user.id) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : service.isActive,
      },
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = session.user as any;
  const serviceId = params.id;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service || service.business.ownerId !== user.id) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Check if service has existing bookings
    const bookingsCount = await prisma.booking.count({
      where: { serviceId },
    });

    if (bookingsCount > 0) {
      // Soft-delete / deactivate to preserve historical data
      const updated = await prisma.service.update({
        where: { id: serviceId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        action: "DEACTIVATED",
        message: "El servicio tiene citas en el historial. Se ha desactivado y ocultado del público.",
        service: updated,
      });
    }

    // If no bookings, permanently delete
    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      action: "DELETED",
      message: "Servicio eliminado de forma permanente.",
    });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Error al eliminar el servicio" }, { status: 500 });
  }
}
