import { describe, it, expect } from "vitest";
import {
  calculateAvailableSlots,
  isBookingActive,
  doIntervalsOverlap,
  ExistingBooking,
} from "../../src/services/availability.service";

describe("Availability Engine - Unit Tests", () => {
  const baseDate = new Date(2026, 9, 15, 0, 0, 0);
  const fixedNow = new Date(2026, 9, 15, 8, 0, 0); // Morning before shift

  const standardBusinessSchedule = {
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  };

  const standardStaffShift = {
    startTime: "09:00",
    endTime: "18:00",
    breakStart: "14:00",
    breakEnd: "15:00",
    isWorking: true,
  };

  it("returns empty slots if business is closed", () => {
    const slots = calculateAvailableSlots({
      date: baseDate,
      serviceDurationMinutes: 30,
      businessSchedule: { ...standardBusinessSchedule, isClosed: true },
      staffShift: standardStaffShift,
      existingBookings: [],
      referenceNow: fixedNow,
    });
    expect(slots).toEqual([]);
  });

  it("returns empty slots if staff is not working", () => {
    const slots = calculateAvailableSlots({
      date: baseDate,
      serviceDurationMinutes: 30,
      businessSchedule: standardBusinessSchedule,
      staffShift: { ...standardStaffShift, isWorking: false },
      existingBookings: [],
      referenceNow: fixedNow,
    });
    expect(slots).toEqual([]);
  });

  it("excludes slots that overlap with staff lunch break (14:00 to 15:00)", () => {
    const slots = calculateAvailableSlots({
      date: baseDate,
      serviceDurationMinutes: 45,
      serviceBufferMinutes: 0,
      businessSchedule: standardBusinessSchedule,
      staffShift: standardStaffShift,
      existingBookings: [],
      slotIntervalMinutes: 15,
      referenceNow: fixedNow,
    });

    // 13:15 (ends at 14:00) -> Allowed
    const slot1315 = slots.find((s) => s.timeString === "13:15");
    expect(slot1315).toBeDefined();

    // 13:30 (ends at 14:15 -> overlaps break 14:00-15:00) -> Must be excluded
    const slot1330 = slots.find((s) => s.timeString === "13:30");
    expect(slot1330).toBeUndefined();

    // 14:00 (inside break) -> Must be excluded
    const slot1400 = slots.find((s) => s.timeString === "14:00");
    expect(slot1400).toBeUndefined();

    // 14:30 (inside break) -> Must be excluded
    const slot1430 = slots.find((s) => s.timeString === "14:30");
    expect(slot1430).toBeUndefined();

    // 15:00 (break ended) -> Allowed
    const slot1500 = slots.find((s) => s.timeString === "15:00");
    expect(slot1500).toBeDefined();
  });

  it("blocks slots colliding with an existing CONFIRMED booking, including buffer time", () => {
    const bookingStart = new Date(baseDate);
    bookingStart.setHours(10, 0, 0, 0);

    const bookingEnd = new Date(baseDate);
    bookingEnd.setHours(10, 30, 0, 0);

    const existingBookings: ExistingBooking[] = [
      {
        id: "booking-1",
        startTime: bookingStart,
        endTime: bookingEnd,
        bufferMinutes: 15, // Booking holds staff until 10:45
        status: "CONFIRMED",
      },
    ];

    const slots = calculateAvailableSlots({
      date: baseDate,
      serviceDurationMinutes: 30,
      serviceBufferMinutes: 0,
      businessSchedule: standardBusinessSchedule,
      staffShift: standardStaffShift,
      existingBookings,
      slotIntervalMinutes: 15,
      referenceNow: fixedNow,
    });

    // 09:30 ends at 10:00 -> Allowed
    expect(slots.find((s) => s.timeString === "09:30")).toBeDefined();

    // 10:00 (starts at booking start) -> Blocked
    expect(slots.find((s) => s.timeString === "10:00")).toBeUndefined();

    // 10:15 (inside booking) -> Blocked
    expect(slots.find((s) => s.timeString === "10:15")).toBeUndefined();

    // 10:30 (inside 15-min buffer time of booking) -> Blocked!
    expect(slots.find((s) => s.timeString === "10:30")).toBeUndefined();

    // 10:45 (buffer has finished) -> Allowed
    expect(slots.find((s) => s.timeString === "10:45")).toBeDefined();
  });

  describe("Autonomous Deto Expiration Logic (expiresAt)", () => {
    it("BLOCKS slot when PENDING reservation has NOT expired yet (expiresAt in future)", () => {
      const now = new Date(2026, 9, 15, 9, 0, 0);

      const bookingStart = new Date(baseDate);
      bookingStart.setHours(11, 0, 0, 0);
      const bookingEnd = new Date(baseDate);
      bookingEnd.setHours(11, 30, 0, 0);

      const pendingBooking: ExistingBooking = {
        id: "pending-active",
        startTime: bookingStart,
        endTime: bookingEnd,
        status: "PENDING",
        // Expires in 15 minutes from 'now'
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      };

      expect(isBookingActive(pendingBooking, now)).toBe(true);

      const slots = calculateAvailableSlots({
        date: baseDate,
        serviceDurationMinutes: 30,
        businessSchedule: standardBusinessSchedule,
        staffShift: standardStaffShift,
        existingBookings: [pendingBooking],
        slotIntervalMinutes: 15,
        referenceNow: now,
      });

      expect(slots.find((s) => s.timeString === "11:00")).toBeUndefined();
    });

    it("RELEASES slot autonomously when PENDING reservation has expired (expiresAt in past)", () => {
      const now = new Date(2026, 9, 15, 9, 30, 0);

      const bookingStart = new Date(baseDate);
      bookingStart.setHours(11, 0, 0, 0);
      const bookingEnd = new Date(baseDate);
      bookingEnd.setHours(11, 30, 0, 0);

      const expiredPendingBooking: ExistingBooking = {
        id: "pending-expired",
        startTime: bookingStart,
        endTime: bookingEnd,
        status: "PENDING",
        // Expired 10 minutes ago
        expiresAt: new Date(now.getTime() - 10 * 60 * 1000),
      };

      // Autonomous check: should NOT be active
      expect(isBookingActive(expiredPendingBooking, now)).toBe(false);

      const slots = calculateAvailableSlots({
        date: baseDate,
        serviceDurationMinutes: 30,
        businessSchedule: standardBusinessSchedule,
        staffShift: standardStaffShift,
        existingBookings: [expiredPendingBooking],
        slotIntervalMinutes: 15,
        referenceNow: now,
      });

      // The slot at 11:00 must be FREE and available!
      const slot1100 = slots.find((s) => s.timeString === "11:00");
      expect(slot1100).toBeDefined();
      expect(slot1100?.available).toBe(true);
    });

    it("IGNORES CANCELLED bookings completely", () => {
      const bookingStart = new Date(baseDate);
      bookingStart.setHours(12, 0, 0, 0);
      const bookingEnd = new Date(baseDate);
      bookingEnd.setHours(12, 30, 0, 0);

      const cancelledBooking: ExistingBooking = {
        id: "cancelled-1",
        startTime: bookingStart,
        endTime: bookingEnd,
        status: "CANCELLED",
      };

      expect(isBookingActive(cancelledBooking, fixedNow)).toBe(false);

      const slots = calculateAvailableSlots({
        date: baseDate,
        serviceDurationMinutes: 30,
        businessSchedule: standardBusinessSchedule,
        staffShift: standardStaffShift,
        existingBookings: [cancelledBooking],
        slotIntervalMinutes: 15,
        referenceNow: fixedNow,
      });

      expect(slots.find((s) => s.timeString === "12:00")).toBeDefined();
    });
  });

  it("filters out past slots on current day according to minLeadTimeMinutes", () => {
    // Current time is 10:10 AM
    const todayNow = new Date(baseDate);
    todayNow.setHours(10, 10, 0, 0);

    const slots = calculateAvailableSlots({
      date: baseDate,
      serviceDurationMinutes: 30,
      businessSchedule: standardBusinessSchedule,
      staffShift: standardStaffShift,
      existingBookings: [],
      slotIntervalMinutes: 15,
      referenceNow: todayNow,
      minLeadTimeMinutes: 15, // Min booking time = 10:25 AM
    });

    // Slots at 09:00, 10:00, 10:15 are excluded
    expect(slots.find((s) => s.timeString === "09:00")).toBeUndefined();
    expect(slots.find((s) => s.timeString === "10:00")).toBeUndefined();
    expect(slots.find((s) => s.timeString === "10:15")).toBeUndefined();

    // Slot at 10:30 is >= 10:25 -> Available
    expect(slots.find((s) => s.timeString === "10:30")).toBeDefined();
  });
});
