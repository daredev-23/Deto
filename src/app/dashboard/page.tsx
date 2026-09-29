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
    return <div>No se encontró negocio para este usuario.</div>;
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
    <div className="space-y-6">
      {/* Tarjetas de métricas simples */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Citas para hoy</span>
          <div className="text-2xl font-bold text-gray-950 mt-1">{todayBookingsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Citas registradas</span>
          <div className="text-2xl font-bold text-gray-950 mt-1">{totalBookingsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Servicios activos</span>
          <div className="text-2xl font-bold text-gray-950 mt-1">{activeServicesCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Zona Horaria</span>
          <div className="text-sm font-semibold text-gray-900 mt-2 truncate">
            {business.timezone}
          </div>
        </div>
      </div>

      {/* Próximas Citas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-950">Próximas Citas</h2>
          <Link
            href="/dashboard/calendar"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Ver todas en la agenda →
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No hay citas agendadas próximamente. Comparte el enlace de tu negocio con tus clientes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Cliente</th>
                  <th className="py-2.5 px-4">Servicio</th>
                  <th className="py-2.5 px-4">Precio</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div>{formatDate(b.startTime)}</div>
                      <div className="text-gray-500">{formatTime(b.startTime)} hrs</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{b.customerName}</div>
                      <div className="text-gray-500">{b.customerEmail}</div>
                      {b.customerPhone && (
                        <div className="text-gray-400">{b.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-800">{b.service.name}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatCurrency(b.totalAmountInCents, b.service.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {b.paymentMethod === "STRIPE" ? "Stripe" : "En local"}
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
