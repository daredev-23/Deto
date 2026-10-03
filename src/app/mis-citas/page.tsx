import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClientBookingsView } from "./client-bookings-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis Citas — Deto",
  description: "Consulta tus citas programadas y tu historial de servicios en Deto.",
};

export default async function MisCitasPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/mis-citas");
  }

  const user = session.user as any;
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      customerId: user.id,
    },
    include: {
      business: {
        select: {
          name: true,
          slug: true,
          phone: true,
          address: true,
        },
      },
      service: {
        select: {
          name: true,
          durationMinutes: true,
          currency: true,
        },
      },
      staffMember: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  const upcoming = bookings.filter((b) => b.startTime >= now && b.status !== "CANCELLED");
  const past = bookings.filter((b) => b.startTime < now || b.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-transparent py-10 md:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 mb-2 shadow-2xs">
            Portal del Cliente
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Mis Citas & Historial
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Bienvenido, <strong>{user.name}</strong>. Revisa tus reservas activas, cancela turnos y consulta el historial.
          </p>
        </div>

        <ClientBookingsView
          upcoming={upcoming.map((b) => ({
            ...b,
            startTime: b.startTime.toISOString(),
            endTime: b.endTime.toISOString(),
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
            expiresAt: b.expiresAt?.toISOString() ?? null,
          }))}
          past={past.map((b) => ({
            ...b,
            startTime: b.startTime.toISOString(),
            endTime: b.endTime.toISOString(),
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
            expiresAt: b.expiresAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}
