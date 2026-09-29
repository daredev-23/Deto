import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { bookingId?: string; simulatedPayment?: string };
}) {
  const { bookingId } = searchParams;

  if (!bookingId) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      business: true,
      service: true,
      staffMember: true,
    },
  });

  if (!booking || booking.business.slug !== params.slug) {
    notFound();
  }

  const isSimulated =
    searchParams.simulatedPayment === "true" ||
    booking.paymentMethod.includes("Simulación");

  // Generate Google Calendar Link
  const startTimeISO = booking.startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTimeISO = booking.endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${booking.service.name} en ${booking.business.name}`
  )}&dates=${startTimeISO}/${endTimeISO}&details=${encodeURIComponent(
    `Cita confirmada para ${booking.customerName}. Folio: ${booking.id}`
  )}&location=${encodeURIComponent(booking.business.address || booking.business.name)}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        {/* Checkmark icon minimalista */}
        <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          ✓
        </div>

        <h1 className="text-2xl font-extrabold text-gray-950 mb-1">
          ¡Cita Confirmada!
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Hemos agendado tu espacio correctamente. Te enviamos los detalles a tu correo electrónico.
        </p>

        {isSimulated && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs text-left">
            <span className="font-bold">ℹ️ Modo Demo / Simulación de Stripe:</span> Dado que Stripe no cuenta con claves secretas de producción en el entorno (.env), el cobro en línea fue procesado en modo simulación de prueba para que puedas experimentar el flujo completo sin errores.
          </div>
        )}

        {/* Resumen ordenado de la cita */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Folio:</span>
            <span className="font-mono text-gray-800 font-bold">{booking.id.slice(-8).toUpperCase()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Negocio:</span>
            <span className="font-semibold text-gray-900">{booking.business.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Servicio:</span>
            <span className="font-semibold text-gray-900">{booking.service.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Atendido por:</span>
            <span className="font-semibold text-gray-900">{booking.staffMember.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Fecha:</span>
            <span className="font-semibold text-gray-900">{formatDate(booking.startTime)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Horario:</span>
            <span className="font-semibold text-gray-900">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)} hrs
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Cliente:</span>
            <span className="font-semibold text-gray-900">{booking.customerName}</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-500">Método de Pago:</span>
            <span className="font-semibold text-gray-900">
              {booking.paymentMethod === "IN_PERSON"
                ? "Pago en el establecimiento"
                : booking.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Total:</span>
            <span className="font-bold text-gray-950 text-sm">
              {formatCurrency(booking.totalAmountInCents, booking.service.currency || "PEN")}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            + Agregar a Google Calendar
          </a>

          <Link
            href="/mis-citas"
            className="block w-full py-2.5 bg-white border border-gray-300 text-gray-800 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Consultar todas mis citas en el Portal
          </Link>

          <Link
            href={`/b/${booking.business.slug}`}
            className="block w-full py-2 text-gray-500 hover:text-gray-900 rounded text-xs transition-colors"
          >
            Volver a la página del negocio
          </Link>
        </div>
      </div>
    </div>
  );
}
