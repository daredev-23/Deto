import { prisma } from "@/lib/db";
import { ExplorarView } from "./explorar-view";

export const metadata = {
  title: "Catálogo de Negocios & Citas — Deto",
  description: "Descubre barberías, salones y especialistas independientes. Agenda tu turno sin llamadas.",
};

export default async function ExplorarPage() {
  const businesses = await prisma.business.findMany({
    include: {
      services: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          priceInCents: true,
          currency: true,
          durationMinutes: true,
        },
        orderBy: { priceInCents: "asc" },
      },
      schedules: {
        where: { isClosed: false },
        orderBy: { dayOfWeek: "asc" },
      },
      staffMembers: {
        where: { isActive: true },
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 py-10 md:py-14 border-b border-zinc-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Cabecera del catálogo */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 mb-2">
              <span>Directorio Público</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{businesses.length} comercio{businesses.length === 1 ? "" : "s"} disponible{businesses.length === 1 ? "" : "s"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Explorar Negocios & Servicios
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 max-w-xl">
              Selecciona tu establecimiento preferido, revisa precios en Soles y reserva turnos en tiempo real.
            </p>
          </div>
        </div>

        <ExplorarView businesses={businesses} />
      </div>
    </div>
  );
}
