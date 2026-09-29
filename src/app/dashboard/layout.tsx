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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4 mb-6">
        <div>
          <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
            Panel de Administración
          </span>
          <h1 className="text-2xl font-bold text-gray-950">
            {business?.name || "Mi Negocio"}
          </h1>
        </div>

        {business && (
          <Link
            href={`/b/${business.slug}`}
            target="_blank"
            className="text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1.5 bg-white font-medium shrink-0"
          >
            Ver página pública ↗
          </Link>
        )}
      </div>

      {/* Navegación interna del Dashboard */}
      <nav className="flex space-x-2 border-b border-gray-200 pb-3 mb-6 text-sm overflow-x-auto">
        <Link
          href="/dashboard"
          className="px-3 py-1.5 font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          Resumen
        </Link>
        <Link
          href="/dashboard/calendar"
          className="px-3 py-1.5 font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          Agenda & Citas
        </Link>
        <Link
          href="/dashboard/services"
          className="px-3 py-1.5 font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          Servicios
        </Link>
      </nav>

      <div>{children}</div>
    </div>
  );
}
