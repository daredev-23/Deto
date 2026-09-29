import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export interface BookingEmailData {
  id: string;
  customerName: string;
  customerEmail: string;
  startTime: Date;
  endTime: Date;
  totalAmountInCents: number;
  paymentMethod: string;
  business: {
    name: string;
    phone?: string | null;
    address?: string | null;
    slug: string;
  };
  service: {
    name: string;
    durationMinutes: number;
    currency: string;
  };
  staffMember: {
    name: string;
  };
}

/**
 * Sends a booking confirmation email using Resend if configured,
 * or logs a clear simulation in development.
 */
export async function sendBookingConfirmationEmail(booking: BookingEmailData): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Deto Citas <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const dateFormatted = formatDate(booking.startTime);
  const timeFormatted = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} hrs`;
  const priceFormatted = formatCurrency(booking.totalAmountInCents, booking.service.currency);
  const clientPortalUrl = `${appUrl}/mis-citas`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #171717; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #111827; margin-bottom: 8px;">¡Tu cita está confirmada!</h2>
      <p style="color: #4b5563; font-size: 14px;">Hola <strong>${booking.customerName}</strong>, tu reserva en <strong>${booking.business.name}</strong> ha sido registrada exitosamente.</p>
      
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 14px;">
        <p style="margin: 4px 0;"><strong>Folio:</strong> ${booking.id.slice(-8).toUpperCase()}</p>
        <p style="margin: 4px 0;"><strong>Servicio:</strong> ${booking.service.name} (${booking.service.durationMinutes} min)</p>
        <p style="margin: 4px 0;"><strong>Especialista:</strong> ${booking.staffMember.name}</p>
        <p style="margin: 4px 0;"><strong>Fecha:</strong> ${dateFormatted}</p>
        <p style="margin: 4px 0;"><strong>Horario:</strong> ${timeFormatted}</p>
        <p style="margin: 4px 0;"><strong>Total:</strong> ${priceFormatted}</p>
        <p style="margin: 4px 0;"><strong>Método de Pago:</strong> ${booking.paymentMethod === "IN_PERSON" ? "Pago en el establecimiento" : booking.paymentMethod}</p>
        ${booking.business.address ? `<p style="margin: 4px 0;"><strong>Dirección:</strong> ${booking.business.address}</p>` : ""}
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${clientPortalUrl}" style="background-color: #111827; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">
          Consultar Mis Citas
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 11px; text-align: center;">
        ${booking.business.name} vía Deto SaaS.
      </p>
    </div>
  `;

  if (!resendApiKey || resendApiKey.startsWith("re_mock") || resendApiKey.includes("placeholder")) {
    console.log(`\n==================================================`);
    console.log(`📧 [EMAIL CONFIRMACIÓN - MODO SIMULADO / RESEND]`);
    console.log(`Para: ${booking.customerEmail}`);
    console.log(`Asunto: Confirmación de Cita en ${booking.business.name} (Folio ${booking.id.slice(-8).toUpperCase()})`);
    console.log(`Fecha: ${dateFormatted} a las ${timeFormatted}`);
    console.log(`Portal de cliente: ${clientPortalUrl}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [booking.customerEmail],
        subject: `Confirmación de Cita en ${booking.business.name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.warn("Error enviando email con Resend:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Excepción al enviar email de confirmación:", error);
    return false;
  }
}

/**
 * Sends a booking cancellation email using Resend if configured,
 * or logs a clear simulation in development.
 */
export async function sendBookingCancellationEmail(booking: BookingEmailData): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Deto Citas <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const dateFormatted = formatDate(booking.startTime);
  const timeFormatted = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} hrs`;
  const priceFormatted = formatCurrency(booking.totalAmountInCents, booking.service.currency);
  const clientPortalUrl = `${appUrl}/mis-citas`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #171717; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #dc2626; margin-bottom: 8px;">Cita Cancelada</h2>
      <p style="color: #4b5563; font-size: 14px;">Hola <strong>${booking.customerName}</strong>, confirmamos que tu reserva en <strong>${booking.business.name}</strong> ha sido cancelada.</p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 14px;">
        <p style="margin: 4px 0;"><strong>Folio:</strong> ${booking.id.slice(-8).toUpperCase()}</p>
        <p style="margin: 4px 0;"><strong>Servicio:</strong> ${booking.service.name} (${booking.service.durationMinutes} min)</p>
        <p style="margin: 4px 0;"><strong>Especialista:</strong> ${booking.staffMember.name}</p>
        <p style="margin: 4px 0;"><strong>Fecha que tenías reservada:</strong> ${dateFormatted}</p>
        <p style="margin: 4px 0;"><strong>Horario:</strong> ${timeFormatted}</p>
        <p style="margin: 4px 0;"><strong>Total:</strong> ${priceFormatted}</p>
      </div>

      <p style="color: #4b5563; font-size: 14px;">Si deseas reagendar, visita el negocio en Deto para ver disponibilidad.</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${clientPortalUrl}" style="background-color: #111827; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">
          Ver Mis Citas
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 11px; text-align: center;">
        ${booking.business.name} vía Deto SaaS.
      </p>
    </div>
  `;

  if (!resendApiKey || resendApiKey.startsWith("re_mock") || resendApiKey.includes("placeholder")) {
    console.log(`\n==================================================`);
    console.log(`📧 [EMAIL CANCELACIÓN - MODO SIMULADO / RESEND]`);
    console.log(`Para: ${booking.customerEmail}`);
    console.log(`Asunto: Cita Cancelada en ${booking.business.name} (Folio ${booking.id.slice(-8).toUpperCase()})`);
    console.log(`Fecha cancelada: ${dateFormatted} a las ${timeFormatted}`);
    console.log(`Portal de cliente: ${clientPortalUrl}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [booking.customerEmail],
        subject: `Cita Cancelada en ${booking.business.name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.warn("Error enviando email de cancelación con Resend:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Excepción al enviar email de cancelación:", error);
    return false;
  }
}
