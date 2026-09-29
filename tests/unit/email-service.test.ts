import { describe, it, expect, vi } from "vitest";
import { sendBookingConfirmationEmail } from "../../src/services/email.service";

describe("Email Service - Transactional Notifications", () => {
  it("successfully simulates booking confirmation email when RESEND_API_KEY is not configured", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mockBooking = {
      id: "booking-abc-1234",
      customerName: "Carlos Pérez",
      customerEmail: "carlos@example.pe",
      startTime: new Date(2026, 9, 20, 10, 0, 0),
      endTime: new Date(2026, 9, 20, 10, 45, 0),
      totalAmountInCents: 3500, // S/ 35.00
      paymentMethod: "IN_PERSON",
      business: {
        name: "Barbería Deto",
        slug: "barberia-deto",
        address: "Av. Larco 456, Miraflores",
      },
      service: {
        name: "Corte de Cabello Clásico",
        durationMinutes: 45,
        currency: "PEN",
      },
      staffMember: {
        name: "Carlos Gómez",
      },
    };

    const sent = await sendBookingConfirmationEmail(mockBooking);
    expect(sent).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("EMAIL CONFIRMACIÓN - MODO SIMULADO"));

    consoleSpy.mockRestore();
  });
});
