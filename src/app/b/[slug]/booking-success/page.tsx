import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { bookingId?: string };
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

  // Generate Google Calendar Link
  const startTimeISO = booking.startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTimeISO = booking.endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${booking.service.name} en ${booking.business.name}`
  )}&dates=${startTimeISO}/${endTimeISO}&details=${encodeURIComponent(
    `Cita confirmada para ${booking.customerName}. Folio: ${booking.id}`
  )}&location=${encodeURIComponent(booking.business.address || booking.business.name)}`;

  return (
    <div className="min-h-screen bg-transparent py-12 md:py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl shadow-violet-900/10 text-center space-y-6">
          {/* Checkmark icon con gradiente radiante */}
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-violet-500/35">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mb-1.5">
              ¡Cita Confirmada!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Hemos agendado tu espacio correctamente. Te enviamos los detalles a tu correo electrónico.
            </p>
          </div>

          {/* Resumen ordenado de la cita (Ticket en liquid glass) */}
          <div className="liquid-glass-subtle p-5 rounded-2xl border border-white/70 text-left text-xs space-y-2.5 shadow-2xs">
            <div className="flex justify-between items-center border-b border-zinc-200/60 pb-2.5">
              <span className="text-zinc-500 font-medium">Folio:</span>
              <span className="font-mono text-violet-900 font-bold bg-white/80 px-2.5 py-0.5 rounded-lg border border-violet-200/60">{booking.id.slice(-8).toUpperCase()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Negocio:</span>
              <span className="font-bold text-zinc-950">{booking.business.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Servicio:</span>
              <span className="font-semibold text-zinc-900">{booking.service.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Atendido por:</span>
              <span className="font-semibold text-zinc-900">{booking.staffMember.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Fecha:</span>
              <span className="font-semibold text-zinc-900">{formatDate(booking.startTime)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Horario:</span>
              <span className="font-semibold text-zinc-900 tabular-nums">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)} hrs
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Cliente:</span>
              <span className="font-semibold text-zinc-900">{booking.customerName}</span>
            </div>

            <div className="flex justify-between border-t border-zinc-200/60 pt-2.5">
              <span className="text-zinc-500 font-medium">Método de Pago:</span>
              <span className="font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
                Pago en el establecimiento
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-zinc-500 font-medium">Total:</span>
              <span className="font-black bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent text-base tabular-nums">
                {formatCurrency(booking.totalAmountInCents, booking.service.currency || "PEN")}
              </span>
            </div>
          </div>

          {/* Acciones ergonómicas */}
          <div className="space-y-3 pt-1">
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-liquid-gradient inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Agregar a Google Calendar</span>
            </a>

            <Link
              href="/mis-citas"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 liquid-glass-subtle border border-white/80 text-zinc-800 rounded-xl text-xs font-semibold hover:bg-white shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Consultar Mis Citas en el Portal</span>
            </Link>

            <Link
              href={`/b/${booking.business.slug}`}
              className="block w-full py-2 text-zinc-500 hover:text-zinc-950 text-xs font-medium transition-colors"
            >
              Volver a la página del negocio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
