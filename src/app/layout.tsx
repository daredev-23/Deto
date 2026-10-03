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
      <body className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-violet-500/20 selection:text-violet-900 relative">
        {/* Ambient atmospheric liquid light orbs */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-300/35 via-purple-200/25 to-transparent rounded-full blur-3xl opacity-75" />
          <div className="absolute top-24 -right-24 w-[550px] h-[550px] bg-gradient-to-bl from-indigo-300/30 via-violet-200/25 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-fuchsia-200/20 via-purple-100/25 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-violet-300/25 to-indigo-200/20 rounded-full blur-3xl opacity-65" />
        </div>

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

          <footer className="border-t border-white/60 liquid-glass-subtle py-10 text-center text-xs text-zinc-500 mt-16">
            <div className="max-w-6xl mx-auto px-4 space-y-2">
              <div className="inline-flex items-center gap-2 font-bold text-zinc-800 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xs shadow-violet-500/50" />
                Deto SaaS
              </div>
              <p className="text-zinc-600">Plataforma moderna y ágil para gestión de reservas y clientes.</p>
              <p className="text-[11px] text-zinc-400">© {new Date().getFullYear()} Deto. Todos los derechos reservados.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
