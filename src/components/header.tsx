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
    <header className="sticky top-0 z-50 w-full liquid-glass border-b border-white/70 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-zinc-950 select-none"
          >
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-900 bg-clip-text text-transparent">Deto</span>
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 group-hover:scale-125 transition-transform duration-200 inline-block shadow-xs shadow-violet-500/50" />
          </Link>

          {/* Navegación según contexto */}
          <nav className="hidden md:flex items-center space-x-1 text-[13px] font-medium text-zinc-600">
            {/* Sin sesión en Landing */}
            {!user && isLanding && (
              <>
                <a
                  href="#como-funciona"
                  className="px-3 py-1.5 rounded-lg hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
                >
                  Cómo funciona
                </a>
                <a
                  href="#negocios"
                  className="px-3 py-1.5 rounded-lg hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
                >
                  Para negocios
                </a>
                <a
                  href="#precios"
                  className="px-3 py-1.5 rounded-lg hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
                >
                  Precios
                </a>
              </>
            )}

            {/* Sin sesión fuera de la landing: enlace directo al catálogo */}
            {!user && !isLanding && (
              <Link
                href="/explorar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/70 transition-colors"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Explorar Catálogo</span>
              </Link>
            )}

            {/* Rol CLIENT: Navegación de cliente */}
            {user?.role === "CLIENT" && (
              <Link
                href="/explorar"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/explorar"
                    ? "text-violet-900 font-semibold bg-violet-100/70 border border-violet-200/60 shadow-xs"
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
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/dashboard"
                      ? "text-violet-900 font-semibold bg-violet-100/70 border border-violet-200/60 shadow-xs"
                      : "hover:text-zinc-950 hover:bg-zinc-100/70"
                  }`}
                >
                  Resumen
                </Link>
                <Link
                  href="/dashboard/calendar"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/dashboard/calendar"
                      ? "text-violet-900 font-semibold bg-violet-100/70 border border-violet-200/60 shadow-xs"
                      : "hover:text-zinc-950 hover:bg-zinc-100/70"
                  }`}
                >
                  Agenda
                </Link>
                <Link
                  href="/dashboard/services"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/dashboard/services"
                      ? "text-violet-900 font-semibold bg-violet-100/70 border border-violet-200/60 shadow-xs"
                      : "hover:text-zinc-950 hover:bg-zinc-100/70"
                  }`}
                >
                  Servicios
                </Link>
                {user.businessSlug && (
                  <Link
                    href={`/b/${user.businessSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-600 hover:text-violet-700 border border-white/80 rounded-lg liquid-glass-subtle hover:bg-violet-50/50 hover:border-violet-200 transition-all ml-1"
                  >
                    <span>Ver mi negocio</span>
                    <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Acciones y Autenticación a la derecha */}
        <div className="flex items-center gap-2.5 text-[13px]">
          {/* Sin sesión: un solo botón de ingreso/registro */}
          {!user && (
            <Link
              href="/login"
              className="btn-liquid-gradient inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Ingresar</span>
              <svg className="w-3.5 h-3.5 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}

          {/* CLIENT autenticado */}
          {user?.role === "CLIENT" && (
            <>
              {upcomingBookings.length > 0 && (
                <Link
                  href="/mis-citas"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 liquid-glass-tint text-violet-950 rounded-xl text-xs font-semibold hover:border-violet-300 active:scale-[0.98] transition-all shadow-xs"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-violet-600 to-indigo-600"></span>
                  </span>
                  <span>{upcomingBookings.length} cita{upcomingBookings.length > 1 ? "s" : ""} próxima{upcomingBookings.length > 1 ? "s" : ""}</span>
                </Link>
              )}

              <Link
                href="/mis-citas"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  pathname === "/mis-citas"
                    ? "text-violet-900 font-semibold bg-violet-100/70 border border-violet-200/60 shadow-xs"
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
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 font-medium text-xs border border-zinc-200/90 rounded-lg bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all cursor-pointer"
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
                className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 font-medium text-xs border border-zinc-200/90 rounded-lg bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all cursor-pointer"
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
