import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const DAYS_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default async function BusinessPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { priceInCents: "asc" },
      },
      schedules: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Breadcrumb hacia catálogo */}
        <div>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-violet-700 transition-colors liquid-glass-subtle px-3.5 py-1.5 rounded-xl border border-white/80 shadow-2xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a Explorar Negocios</span>
          </Link>
        </div>

        {/* Encabezado del negocio */}
        <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-xl shadow-violet-900/5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 mb-1 shadow-2xs">
                Establecimiento Verificado
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
                {business.name}
              </h1>
            </div>
          </div>

          {business.description && (
            <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed mb-6">
              {business.description}
            </p>
          )}

          <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-zinc-500 pt-5 border-t border-zinc-200/60">
            {business.address && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-zinc-800 font-medium">{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-zinc-800 font-medium">{business.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{business.timezone}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Catálogo de Servicios */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <h2 className="text-lg font-extrabold text-zinc-950 tracking-tight">
                Servicios Disponibles
              </h2>
              <span className="text-xs font-semibold text-zinc-400">
                {business.services.length} opciones
              </span>
            </div>

            {business.services.length === 0 ? (
              <div className="liquid-glass p-8 rounded-3xl border border-white/80 text-center text-sm text-zinc-500 shadow-sm">
                Este negocio no tiene servicios activos por el momento.
              </div>
            ) : (
              business.services.map((service) => (
                <div
                  key={service.id}
                  className="liquid-glass p-6 rounded-2xl border border-white/80 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-900/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-zinc-950 text-base">{service.name}</h3>
                    {service.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed max-w-md">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-zinc-600 pt-1">
                      <span className="inline-flex items-center gap-1 font-medium bg-white/80 border border-zinc-200/60 px-2.5 py-0.5 rounded-lg text-zinc-700">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{service.durationMinutes} min</span>
                      </span>
                      {service.bufferMinutes > 0 && (
                        <span className="text-zinc-400">({service.bufferMinutes} min intervalo)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <span className="text-lg font-extrabold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent tabular-nums">
                      {formatCurrency(service.priceInCents, service.currency)}
                    </span>
                    <Link
                      href={`/b/${business.slug}/book/${service.id}`}
                      className="btn-liquid-gradient inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Reservar Cita</span>
                      <svg className="w-3.5 h-3.5 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Horarios de Atención */}
          <div>
            <div className="liquid-glass p-6 rounded-3xl border border-white/80 shadow-md sticky top-24">
              <h3 className="text-sm font-bold text-zinc-950 mb-4 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Horario de Atención</span>
              </h3>
              <ul className="space-y-2.5 text-xs">
                {business.schedules.map((schedule) => (
                  <li
                    key={schedule.id}
                    className="flex justify-between items-center text-zinc-600 py-1.5 border-b border-zinc-100/60 last:border-0"
                  >
                    <span className="font-semibold text-zinc-800">{DAYS_NAMES[schedule.dayOfWeek]}</span>
                    {schedule.isClosed ? (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">Cerrado</span>
                    ) : (
                      <span className="tabular-nums font-medium text-zinc-900">
                        {schedule.openTime} - {schedule.closeTime}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
