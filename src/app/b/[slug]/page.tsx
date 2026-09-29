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
        orderBy: { name: "asc" },
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb hacia catálogo */}
      <div className="mb-4">
        <Link
          href="/explorar"
          className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 font-medium"
        >
          ← Volver a Explorar Negocios
        </Link>
      </div>

      {/* Encabezado del negocio */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight mb-2">
          {business.name}
        </h1>
        {business.description && (
          <p className="text-gray-600 text-sm max-w-2xl mb-4">
            {business.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          {business.address && (
            <div>
              <span className="font-semibold text-gray-700">Dirección:</span> {business.address}
            </div>
          )}
          {business.phone && (
            <div>
              <span className="font-semibold text-gray-700">Teléfono:</span> {business.phone}
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-700">Zona Horaria:</span> {business.timezone}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Catálogo de Servicios */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
            Servicios Disponibles
          </h2>

          {business.services.length === 0 ? (
            <p className="text-sm text-gray-500 py-6">
              Este negocio no tiene servicios activos por el momento.
            </p>
          ) : (
            business.services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
                  {service.description && (
                    <p className="text-xs text-gray-500">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                    <span>⏱ {service.durationMinutes} min</span>
                    {service.bufferMinutes > 0 && (
                      <span className="text-gray-400">({service.bufferMinutes} min buffer)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(service.priceInCents, service.currency)}
                  </span>
                  <Link
                    href={`/b/${business.slug}/book/${service.id}`}
                    className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Reservar Cita
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Horarios de Atención */}
        <div>
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
              Horario de Atención
            </h3>
            <ul className="space-y-2 text-xs">
              {business.schedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="flex justify-between items-center text-gray-600 py-0.5"
                >
                  <span className="font-medium">{DAYS_NAMES[schedule.dayOfWeek]}</span>
                  {schedule.isClosed ? (
                    <span className="text-red-500 font-medium">Cerrado</span>
                  ) : (
                    <span>
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
  );
}
