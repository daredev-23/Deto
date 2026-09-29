import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        business: {
          select: {
            name: true,
            slug: true,
            phone: true,
            address: true,
          },
        },
        service: {
          select: {
            name: true,
            durationMinutes: true,
            currency: true,
          },
        },
        staffMember: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const now = new Date();
    const upcoming = bookings.filter((b) => b.startTime >= now && b.status !== "CANCELLED");
    const past = bookings.filter((b) => b.startTime < now || b.status === "CANCELLED");

    return NextResponse.json({
      total: bookings.length,
      upcoming,
      past,
    });
  } catch (error: any) {
    console.error("Error retrieving client bookings:", error);
    return NextResponse.json({ error: "Error al consultar citas" }, { status: 500 });
  }
}
