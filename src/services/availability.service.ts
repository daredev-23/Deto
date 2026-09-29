import { parseTimeToMinutes, minutesToTimeString } from "@/lib/utils";

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface DaySchedule {
  openTime: string;  // "09:00"
  closeTime: string; // "19:00"
  isClosed?: boolean;
}

export interface StaffShift {
  startTime: string;   // "09:00"
  endTime: string;     // "19:00"
  breakStart?: string | null; // "14:00"
  breakEnd?: string | null;   // "15:00"
  isWorking?: boolean;
}

export interface ExistingBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  bufferMinutes?: number;
  status: string; // "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED", "NO_SHOW"
  expiresAt?: Date | null;
}

export interface CalculateSlotsParams {
  date: Date; // The specific date (e.g., 2026-10-01)
  serviceDurationMinutes: number;
  serviceBufferMinutes?: number;
  businessSchedule?: DaySchedule | null;
  staffShift?: StaffShift | null;
  existingBookings: ExistingBooking[];
  slotIntervalMinutes?: number; // Step interval, default 15 mins
  referenceNow?: Date; // Allows deterministic testing of past slots
  minLeadTimeMinutes?: number; // Minimum notice time in minutes (default 15)
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  timeString: string; // "09:30"
  available: boolean;
  reason?: string;
}

/**
 * Checks if a booking is currently blocking availability.
 * A booking blocks if it is CONFIRMED or COMPLETED.
 * If it is PENDING, it ONLY blocks if expiresAt > referenceNow (internal Deto logic).
 * CANCELLED or expired PENDING bookings never block!
 */
export function isBookingActive(booking: ExistingBooking, referenceNow: Date = new Date()): boolean {
  if (booking.status === "CANCELLED" || booking.status === "NO_SHOW") {
    return false;
  }
  if (booking.status === "PENDING") {
    if (!booking.expiresAt) return false;
    // Autonomous check: only active if not expired yet
    return booking.expiresAt.getTime() > referenceNow.getTime();
  }
  return booking.status === "CONFIRMED" || booking.status === "COMPLETED";
}

/**
 * Checks whether two time ranges overlap, accounting for buffer times.
 */
export function doIntervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Pure function: calculates available time slots for a specific day.
 */
export function calculateAvailableSlots(params: CalculateSlotsParams): TimeSlot[] {
  const {
    date,
    serviceDurationMinutes,
    serviceBufferMinutes = 0,
    businessSchedule,
    staffShift,
    existingBookings,
    slotIntervalMinutes = 15,
    referenceNow = new Date(),
    minLeadTimeMinutes = 15,
  } = params;

  // 1. If business is closed or staff is not working, return empty array
  if (!businessSchedule || businessSchedule.isClosed) {
    return [];
  }
  if (!staffShift || staffShift.isWorking === false) {
    return [];
  }

  // 2. Parse operational hours
  const businessOpenMin = parseTimeToMinutes(businessSchedule.openTime);
  const businessCloseMin = parseTimeToMinutes(businessSchedule.closeTime);

  const staffStartMin = parseTimeToMinutes(staffShift.startTime);
  const staffEndMin = parseTimeToMinutes(staffShift.endTime);

  // The effective shift is the intersection of business and staff hours
  const effectiveStartMin = Math.max(businessOpenMin, staffStartMin);
  const effectiveEndMin = Math.min(businessCloseMin, staffEndMin);

  if (effectiveStartMin >= effectiveEndMin) {
    return [];
  }

  // Staff break interval in minutes
  const hasBreak = staffShift.breakStart && staffShift.breakEnd;
  const breakStartMin = hasBreak ? parseTimeToMinutes(staffShift.breakStart!) : null;
  const breakEndMin = hasBreak ? parseTimeToMinutes(staffShift.breakEnd!) : null;

  // 3. Filter active bookings that actually block slots
  const activeBookings = existingBookings.filter((b) => isBookingActive(b, referenceNow));

  const slots: TimeSlot[] = [];

  // 4. Generate candidate slots with interval
  for (
    let currentMin = effectiveStartMin;
    currentMin + serviceDurationMinutes <= effectiveEndMin;
    currentMin += slotIntervalMinutes
  ) {
    const slotEndTimeMin = currentMin + serviceDurationMinutes;
    const slotTotalOccupiedEndMin = slotEndTimeMin + serviceBufferMinutes;

    // Check if total occupied time exceeds shift
    if (slotTotalOccupiedEndMin > effectiveEndMin) {
      continue;
    }

    // Check if slot overlaps with staff break
    if (breakStartMin !== null && breakEndMin !== null) {
      const overlapsBreak =
        currentMin < breakEndMin && slotTotalOccupiedEndMin > breakStartMin;
      if (overlapsBreak) {
        continue;
      }
    }

    // Build actual Date objects for the slot using local year/month/date
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const slotStart = new Date(
      year,
      month,
      day,
      Math.floor(currentMin / 60),
      currentMin % 60,
      0,
      0
    );

    const slotEnd = new Date(
      year,
      month,
      day,
      Math.floor(slotEndTimeMin / 60),
      slotEndTimeMin % 60,
      0,
      0
    );

    const slotBufferEnd = new Date(
      year,
      month,
      day,
      Math.floor(slotTotalOccupiedEndMin / 60),
      slotTotalOccupiedEndMin % 60,
      0,
      0
    );

    // Check if slot is in the past or violates minimum lead time
    const minBookingTime = new Date(referenceNow.getTime() + minLeadTimeMinutes * 60 * 1000);
    if (slotStart.getTime() < minBookingTime.getTime()) {
      continue;
    }

    // Check for collisions with active bookings (including their buffer times)
    let hasCollision = false;
    for (const booking of activeBookings) {
      const bookingBufferMinutes = booking.bufferMinutes || 0;
      const bookingTotalEnd = new Date(
        booking.endTime.getTime() + bookingBufferMinutes * 60 * 1000
      );

      // Collision check
      if (doIntervalsOverlap(slotStart, slotBufferEnd, booking.startTime, bookingTotalEnd)) {
        hasCollision = true;
        break;
      }
    }

    if (!hasCollision) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        timeString: minutesToTimeString(currentMin),
        available: true,
      });
    }
  }

  return slots;
}
