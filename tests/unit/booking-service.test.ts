import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBooking } from "../../src/services/booking.service";
import { prisma } from "../../src/lib/db";

// Mock Prisma for booking service tests
vi.mock("../../src/lib/db", () => {
  return {
    prisma: {
      $transaction: vi.fn(),
      booking: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        findMany: vi.fn(),
      },
      service: {
        findUnique: vi.fn(),
      },
      staffMember: {
        findFirst: vi.fn(),
      },
    },
  };
});

describe("Booking Service - Atomic Creation & Conflict Detection", () => {
  const baseTime = new Date("2026-10-20T10:00:00.000Z");

  const mockService = {
    id: "service-1",
    businessId: "biz-1",
    name: "Corte Clásico",
    durationMinutes: 30,
    bufferMinutes: 10,
    priceInCents: 20000,
    isActive: true,
  };

  const mockStaff = {
    id: "staff-1",
    businessId: "biz-1",
    isDefault: true,
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully creates a CONFIRMED booking when paymentMethod is IN_PERSON", async () => {
    const mockTx = {
      service: {
        findUnique: vi.fn().mockResolvedValue(mockService),
      },
      staffMember: {
        findFirst: vi.fn().mockResolvedValue(mockStaff),
      },
      booking: {
        findFirst: vi.fn().mockResolvedValue(null), // No conflict!
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "book-new", ...data })),
      },
    };

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      return await cb(mockTx);
    });

    const result = await createBooking({
      businessId: "biz-1",
      serviceId: "service-1",
      customerName: "Juan Pérez",
      customerEmail: "juan@test.com",
      startTime: baseTime,
      paymentMethod: "IN_PERSON",
    });

    expect(result.success).toBe(true);
    expect(result.booking.status).toBe("CONFIRMED");
    expect(result.booking.paymentMethod).toBe("IN_PERSON");
    expect(result.booking.expiresAt).toBeNull();
  });


  it("rejects booking with SLOT_OCCUPIED if a conflicting booking exists", async () => {
    const conflictingBooking = {
      id: "conflict-1",
      startTime: baseTime,
      endTime: new Date(baseTime.getTime() + 30 * 60 * 1000),
      status: "CONFIRMED",
    };

    const mockTx = {
      service: {
        findUnique: vi.fn().mockResolvedValue(mockService),
      },
      staffMember: {
        findFirst: vi.fn().mockResolvedValue(mockStaff),
      },
      booking: {
        findFirst: vi.fn().mockResolvedValue(conflictingBooking), // Found collision!
        create: vi.fn(),
      },
    };

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      return await cb(mockTx);
    });

    const result = await createBooking({
      businessId: "biz-1",
      serviceId: "service-1",
      customerName: "Carlos Cliente",
      customerEmail: "carlos@test.com",
      startTime: baseTime,
      paymentMethod: "IN_PERSON",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("SLOT_OCCUPIED");
    expect(mockTx.booking.create).not.toHaveBeenCalled();
  });
});
