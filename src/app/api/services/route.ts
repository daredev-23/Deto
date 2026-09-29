import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = session.user as any;
  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { name, description, durationMinutes, bufferMinutes = 0, priceInSoles, priceInPesos } = body;
    const finalPrice = priceInSoles !== undefined ? priceInSoles : priceInPesos;

    if (!name || !durationMinutes || finalPrice === undefined) {
      return NextResponse.json(
        { error: "Nombre, duración y precio son requeridos" },
        { status: 400 }
      );
    }

    const defaultStaff = await prisma.staffMember.findFirst({
      where: { businessId: business.id, isDefault: true },
    });

    const newService = await prisma.service.create({
      data: {
        businessId: business.id,
        name,
        description: description || null,
        durationMinutes: parseInt(durationMinutes, 10),
        bufferMinutes: parseInt(bufferMinutes, 10) || 0,
        priceInCents: Math.round(parseFloat(finalPrice) * 100),
        currency: business.currency || "PEN",
        staffMembers: defaultStaff
          ? {
              connect: [{ id: defaultStaff.id }],
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Error al crear el servicio" }, { status: 500 });
  }
}
