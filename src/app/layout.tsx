import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Deto - Reservas para Negocios y Profesionales",
  description: "Plataforma de reservas y gestión de citas para barberías, salones, consultorios y profesionales independientes.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  let upcomingBookings: { id: string; startTime: string; service: { name: string } }[] = [];

  if (user?.role === "CLIENT" && user?.id) {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          customerId: user.id,
          status: "CONFIRMED",
          startTime: { gte: new Date() },
        },
        include: {
          service: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
        take: 3,
      });

      upcomingBookings = bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime.toISOString(),
        service: { name: b.service.name },
      }));
    } catch (e) {
      console.error("Error cargando citas para header:", e);
    }
  }

  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased">
        <Providers>
          <Header
            user={
              user
                ? {
                    name: user.name,
                    role: user.role,
                    businessSlug: user.businessSlug ?? null,
                  }
                : null
            }
            upcomingBookings={upcomingBookings}
          />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-gray-200 bg-white py-8 text-center text-xs text-gray-500">
            <div className="max-w-6xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-gray-700">Deto SaaS Reservas</p>
              <p>Plataforma minimalista y ágil para gestión de reservas y clientes.</p>
              <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} Deto. Todos los derechos reservados.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
