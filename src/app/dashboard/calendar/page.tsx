import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CalendarView } from "./calendar-view";

export default async function DashboardCalendarPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    return <div>No se encontró negocio para este usuario.</div>;
  }

  const rawBookings = await prisma.booking.findMany({
    where: { businessId: business.id },
    include: {
      service: true,
    },
    orderBy: { startTime: "asc" },
  });

  const bookings = rawBookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    paymentMethod: b.paymentMethod,
    totalAmountInCents: b.totalAmountInCents,
    service: {
      name: b.service.name,
      currency: b.service.currency,
    },
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-950">
          Agenda y Control de Citas
        </h2>
      </div>

      <CalendarView initialBookings={bookings} />
    </div>
  );
}
