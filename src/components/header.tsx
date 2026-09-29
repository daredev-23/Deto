"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UpcomingBooking {
  id: string;
  startTime: string;
  service: { name: string };
}

interface HeaderUser {
  name?: string | null;
  role: string;
  businessSlug?: string | null;
}

export function Header({
  user,
  upcomingBookings = [],
}: {
  user: HeaderUser | null;
  upcomingBookings?: UpcomingBooking[];
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-zinc-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-xl font-extrabold tracking-tighter text-zinc-950 select-none"
          >
            <span>Deto</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 group-hover:scale-125 transition-transform duration-200 inline-block" />
          </Link>

          {/* Navegación según contexto */}
          <nav className="hidden md:flex items-center space-x-1 text-[13px] font-medium text-zinc-600">
            {/* Sin sesión en Landing */}
            {!user && isLanding && (
              <>
                <a
                  href="#como-funciona"
                  className="px-3 py-1.5 rounded-md hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
                >
                  Cómo funciona
                </a>
                <a
                  href="#negocios"
                  className="px-3 py-1.5 rounded-md hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
                >
                  Para negocios
                </a>
                <a
                  href="#precios"
                  className="px-3 py-1.5 rounded-md hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
                >
                  Precios
                </a>
              </>
            )}

            {/* Sin sesión fuera de la landing: enlace directo al catálogo */}
            {!user && !isLanding && (
              <Link
                href="/explorar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
              >
                <span className="text-zinc-400">←</span>
                <span>Explorar Catálogo</span>
              </Link>
            )}

            {/* Rol CLIENT: Navegación de cliente */}
            {user?.role === "CLIENT" && (
              <Link
                href="/explorar"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/explorar"
                    ? "text-zinc-950 font-semibold bg-zinc-100"
                    : "hover:text-zinc-950 hover:bg-zinc-100/70"
                }`}
              >
                Explorar Negocios
              </Link>
            )}

            {/* Rol BUSINESS_OWNER: Enlaces de gestión con jerarquía clara */}
            {user?.role === "BUSINESS_OWNER" && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/dashboard"
                      ? "text-zinc-950 font-semibold bg-zinc-100"
                      : "hover:text-zinc-950 hover:bg-zinc-100/70"
                  }`}
                >
                  Resumen
                </Link>
                <Link
                  href="/dashboard/calendar"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/dashboard/calendar"
                      ? "text-zinc-950 font-semibold bg-zinc-100"
                      : "hover:text-zinc-950 hover:bg-zinc-100/70"
                  }`}
                >
                  Agenda
                </Link>
                <Link
                  href="/dashboard/services"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/dashboard/services"
                      ? "text-zinc-950 font-semibold bg-zinc-100"
                      : "hover:text-zinc-950 hover:bg-zinc-100/70"
                  }`}
                >
                  Servicios
                </Link>
                {user.businessSlug && (
                  <Link
                    href={`/b/${user.businessSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 rounded-md bg-zinc-50/50 hover:bg-white transition-all ml-1"
                  >
                    <span>Ver mi negocio</span>
                    <span className="text-[10px] text-zinc-400">↗</span>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Acciones y Autenticación a la derecha */}
        <div className="flex items-center gap-2.5 text-[13px]">
          {/* Sin sesión */}
          {!user && (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-zinc-700 hover:text-zinc-950 font-medium rounded-md hover:bg-zinc-100/80 transition-colors"
              >
                Iniciar Sesión
              </Link>

              {!isLanding && (
                <Link
                  href="/register/client"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-zinc-800 bg-white border border-zinc-200/90 rounded-md hover:bg-zinc-50 hover:border-zinc-300 font-medium shadow-2xs active:scale-[0.98] transition-all"
                >
                  Crear Cuenta
                </Link>
              )}

              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium shadow-sm shadow-zinc-950/10 active:scale-[0.98] transition-all"
              >
                <span>{isLanding ? "Registrar Negocio" : "Para Negocios"}</span>
                <span className="text-zinc-400 text-xs">→</span>
              </Link>
            </>
          )}

          {/* CLIENT autenticado */}
          {user?.role === "CLIENT" && (
            <>
              {upcomingBookings.length > 0 && (
                <Link
                  href="/mis-citas"
                  className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 rounded-md text-xs font-semibold hover:bg-emerald-100/80 active:scale-[0.98] transition-all"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>{upcomingBookings.length} cita{upcomingBookings.length > 1 ? "s" : ""} próxima{upcomingBookings.length > 1 ? "s" : ""}</span>
                </Link>
              )}

              <Link
                href="/mis-citas"
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  pathname === "/mis-citas"
                    ? "text-zinc-950 font-semibold bg-zinc-100"
                    : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/70"
                }`}
              >
                Mis Citas
              </Link>

              <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

              <span className="text-xs text-zinc-500 font-medium hidden sm:inline-block max-w-[130px] truncate">
                {user.name}
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 font-medium text-xs border border-zinc-200/90 rounded-md bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all"
              >
                Salir
              </button>
            </>
          )}

          {/* BUSINESS_OWNER autenticado */}
          {user?.role === "BUSINESS_OWNER" && (
            <>
              <span className="text-xs text-zinc-600 font-medium hidden sm:inline-block max-w-[130px] truncate">
                {user.name}
              </span>

              <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 font-medium text-xs border border-zinc-200/90 rounded-md bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
