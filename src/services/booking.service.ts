import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CreateBookingInput {
  businessId: string;
  serviceId: string;
  staffMemberId?: string; // Optional in V1, fallback to default staff
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  startTime: Date;
  paymentMethod?: "IN_PERSON" | "STRIPE";
}

export interface BookingResult {
  success: boolean;
  booking?: any;
  error?: "BUSINESS_NOT_FOUND" | "SERVICE_NOT_FOUND" | "STAFF_NOT_FOUND" | "SLOT_OCCUPIED" | "INTERNAL_ERROR";
  message?: string;
}

/**
 * Creates a booking atomically within a database transaction.
 * Guarantees no double-booking even under concurrent requests.
 * Evaluates internal expiresAt to ignore expired holds.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const {
    businessId,
    serviceId,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    startTime,
    paymentMethod = "IN_PERSON",
  } = input;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch service to get duration and buffer
      const service = await tx.service.findUnique({
        where: { id: serviceId },
      });

      if (!service || !service.isActive || service.businessId !== businessId) {
        return { success: false, error: "SERVICE_NOT_FOUND" as const, message: "El servicio no existe o no está activo." };
      }

      // 2. Identify staff member (provided or default for business in V1)
      let staffMemberId = input.staffMemberId;
      if (!staffMemberId) {
        const defaultStaff = await tx.staffMember.findFirst({
          where: { businessId, isDefault: true, isActive: true },
        });
        if (!defaultStaff) {
          return { success: false, error: "STAFF_NOT_FOUND" as const, message: "No hay especialista disponible asignado." };
        }
        staffMemberId = defaultStaff.id;
      }

      // 3. Compute end time
      const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);
      const totalOccupiedEnd = new Date(endTime.getTime() + service.bufferMinutes * 60 * 1000);

      // 4. Concurrency check: find any active, overlapping booking for this staff member
      const now = new Date();
      const existingConflict = await tx.booking.findFirst({
        where: {
          staffMemberId,
          startTime: { lt: totalOccupiedEnd },
          endTime: { gt: startTime },
          OR: [
            { status: { in: ["CONFIRMED", "COMPLETED"] } },
            {
              status: "PENDING",
              expiresAt: { gt: now }, // Deto's internal check: only blocks if NOT expired
            },
          ],
        },
      });

      if (existingConflict) {
        return {
          success: false,
          error: "SLOT_OCCUPIED" as const,
          message: "El horario seleccionado ya no está disponible. Por favor elige otro horario.",
        };
      }

      // 5. Determine booking status based on payment method
      const isStripe = paymentMethod === "STRIPE";
      const status = isStripe ? "PENDING" : "CONFIRMED";
      const expiresAt = isStripe ? new Date(now.getTime() + 15 * 60 * 1000) : null;

      // 6. Create booking
      const newBooking = await tx.booking.create({
        data: {
          businessId,
          serviceId,
          staffMemberId,
          customerId: customerId || null,
          customerName,
          customerEmail,
          customerPhone,
          notes,
          startTime,
          endTime,
          status,
          paymentMethod,
          paymentStatus: "PENDING",
          totalAmountInCents: service.priceInCents,
          expiresAt,
        },
        include: {
          service: true,
          staffMember: true,
          business: true,
        },
      });

      return { success: true, booking: newBooking };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return result;
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Ocurrió un error al procesar la reserva. Intenta nuevamente.",
    };
  }
}

/**
 * Updates booking status (e.g. COMPLETED, CANCELLED, NO_SHOW, CONFIRMED).
 */
export async function updateBookingStatus(
  bookingId: string,
  businessId: string,
  newStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
) {
  return await prisma.booking.updateMany({
    where: {
      id: bookingId,
      businessId,
    },
    data: {
      status: newStatus,
    },
  });
}

/**
 * Retrieves bookings for calendar and list views within a date range.
 */
export async function getBusinessBookings(
  businessId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    staffMemberId?: string;
    status?: string;
  }
) {
  const where: Prisma.BookingWhereInput = { businessId };

  if (filters?.startDate || filters?.endDate) {
    where.startTime = {};
    if (filters.startDate) where.startTime.gte = filters.startDate;
    if (filters.endDate) where.startTime.lte = filters.endDate;
  }

  if (filters?.staffMemberId) {
    where.staffMemberId = filters.staffMemberId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  return await prisma.booking.findMany({
    where,
    include: {
      service: true,
      staffMember: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });
}
