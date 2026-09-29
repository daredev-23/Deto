import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateAvailableSlots } from "@/services/availability.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessSlug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD
  const staffMemberIdParam = searchParams.get("staffMemberId");

  if (!businessSlug || !serviceId || !dateParam) {
    return NextResponse.json(
      { error: "Parámetros faltantes: slug, serviceId y date son obligatorios" },
      { status: 400 }
    );
  }

  try {
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      include: {
        schedules: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive || service.businessId !== business.id) {
      return NextResponse.json({ error: "Servicio no válido" }, { status: 404 });
    }

    // Identify staff member: either provided, or default
    let staffMemberId = staffMemberIdParam;
    if (!staffMemberId) {
      const defaultStaff = await prisma.staffMember.findFirst({
        where: { businessId: business.id, isDefault: true, isActive: true },
      });
      if (!defaultStaff) {
        return NextResponse.json({ error: "No hay personal disponible" }, { status: 404 });
      }
      staffMemberId = defaultStaff.id;
    }

    // Parse date (e.g. "2026-10-15")
    const [year, month, day] = dateParam.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday

    // Load business schedule for this day
    const businessSchedule = business.schedules.find((s) => s.dayOfWeek === dayOfWeek);

    // Load staff schedule
    const staffSchedule = await prisma.staffSchedule.findUnique({
      where: {
        staffMemberId_dayOfWeek: {
          staffMemberId,
          dayOfWeek,
        },
      },
    });

    // Load bookings for target date
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        staffMemberId,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        service: true,
      },
    });

    const mappedBookings = existingBookings.map((b) => ({
      id: b.id,
      startTime: b.startTime,
      endTime: b.endTime,
      bufferMinutes: b.service.bufferMinutes,
      status: b.status,
      expiresAt: b.expiresAt,
    }));

    const slots = calculateAvailableSlots({
      date: targetDate,
      serviceDurationMinutes: service.durationMinutes,
      serviceBufferMinutes: service.bufferMinutes,
      businessSchedule: businessSchedule
        ? {
            openTime: businessSchedule.openTime,
            closeTime: businessSchedule.closeTime,
            isClosed: businessSchedule.isClosed,
          }
        : null,
      staffShift: staffSchedule
        ? {
            startTime: staffSchedule.startTime,
            endTime: staffSchedule.endTime,
            breakStart: staffSchedule.breakStart,
            breakEnd: staffSchedule.breakEnd,
            isWorking: staffSchedule.isWorking,
          }
        : null,
      existingBookings: mappedBookings,
      slotIntervalMinutes: 15,
      referenceNow: new Date(),
    });

    return NextResponse.json({
      date: dateParam,
      service: {
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        priceInCents: service.priceInCents,
      },
      slots,
    });
  } catch (error: any) {
    console.error("Error in availability API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
