import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center text-sm text-zinc-500">
        No se encontró negocio para este usuario.
      </div>
    );
  }

  // Load bookings
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [todayBookingsCount, totalBookingsCount, activeServicesCount, upcomingBookings] =
    await Promise.all([
      prisma.booking.count({
        where: {
          businessId: business.id,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),
      prisma.booking.count({
        where: { businessId: business.id },
      }),
      prisma.service.count({
        where: { businessId: business.id, isActive: true },
      }),
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          startTime: { gte: startOfDay },
        },
        include: {
          service: true,
          staffMember: true,
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      {/* Tarjetas de métricas profesionales en liquid glass */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="liquid-glass p-6 rounded-3xl border border-white/80 shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500">Citas para hoy</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-zinc-950 via-zinc-800 to-violet-950 bg-clip-text text-transparent tabular-nums">{todayBookingsCount}</div>
        </div>

        <div className="liquid-glass p-6 rounded-3xl border border-white/80 shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500">Total registradas</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-zinc-950 via-zinc-800 to-violet-950 bg-clip-text text-transparent tabular-nums">{totalBookingsCount}</div>
        </div>

        <div className="liquid-glass p-6 rounded-3xl border border-white/80 shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500">Servicios activos</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-zinc-950 via-zinc-800 to-violet-950 bg-clip-text text-transparent tabular-nums">{activeServicesCount}</div>
        </div>

        <div className="liquid-glass p-6 rounded-3xl border border-white/80 shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500">Zona Horaria</span>
            <div className="w-10 h-10 rounded-2xl liquid-glass-tint text-violet-700 flex items-center justify-center border border-violet-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-sm font-bold text-zinc-900 truncate mt-2">
            {business.timezone}
          </div>
        </div>
      </div>

      {/* Próximas Citas */}
      <div className="liquid-glass rounded-3xl border border-white/80 shadow-md overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-200/60 flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-zinc-950">Próximas Citas en tu Agenda</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Turnos asignados a partir de hoy</p>
          </div>
          <Link
            href="/dashboard/calendar"
            className="inline-flex items-center gap-1.5 text-xs text-violet-950 hover:text-violet-900 font-bold liquid-glass-tint px-3.5 py-1.5 rounded-xl border border-violet-200/80 shadow-2xs transition-colors"
          >
            <span>Ver agenda completa</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-500 space-y-2">
            <p>No hay citas agendadas próximamente.</p>
            <p className="text-xs text-zinc-400">Comparte el enlace de tu perfil público con tus clientes para recibir reservas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-600 border-b border-zinc-200/80 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Fecha y Hora</th>
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-5">Servicio</th>
                  <th className="py-3.5 px-5">Precio</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {upcomingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-zinc-900">
                      <div className="font-bold">{formatDate(b.startTime)}</div>
                      <div className="text-zinc-500 font-mono text-[11px] tabular-nums">{formatTime(b.startTime)} hrs</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-zinc-900">{b.customerName}</div>
                      <div className="text-zinc-500">{b.customerEmail}</div>
                      {b.customerPhone && (
                        <div className="text-zinc-400 text-[11px]">{b.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-800 font-medium">{b.service.name}</td>
                    <td className="py-3.5 px-5 font-bold text-zinc-950 tabular-nums">
                      {formatCurrency(b.totalAmountInCents, b.service.currency)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          b.status === "CONFIRMED"
                            ? "bg-violet-50 text-violet-700 border-violet-200/70"
                            : b.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border-blue-200/70"
                            : b.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200/70"
                            : "bg-zinc-100 text-zinc-700 border-zinc-200/70"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 font-medium">
                      En el local
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
