import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  return (
    <div className="min-h-screen bg-transparent py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/60 gap-4">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 mb-1 shadow-2xs">
              Panel de Administración
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {business?.name || "Mi Negocio"}
            </h1>
          </div>

          {business && (
            <Link
              href={`/b/${business.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-violet-700 border border-white/80 rounded-xl liquid-glass-subtle hover:bg-white shadow-xs active:scale-[0.98] transition-all shrink-0 cursor-pointer"
            >
              <span>Ver página pública</span>
              <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
        </div>

        {/* Navegación interna del Dashboard con tabs profesionales en liquid glass */}
        <nav className="liquid-glass-subtle p-1.5 rounded-2xl border border-white/70 flex space-x-2 text-xs font-semibold overflow-x-auto shadow-xs">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-white/80 transition-all"
          >
            Resumen
          </Link>
          <Link
            href="/dashboard/calendar"
            className="px-4 py-2 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-white/80 transition-all"
          >
            Agenda & Citas
          </Link>
          <Link
            href="/dashboard/services"
            className="px-4 py-2 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-white/80 transition-all"
          >
            Servicios & Tarifas
          </Link>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
