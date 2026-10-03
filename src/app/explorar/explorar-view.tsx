"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
  durationMinutes: number;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  services: Service[];
  schedules: { dayOfWeek: number }[];
  staffMembers: { id: string; name: string }[];
}

const QUICK_FILTERS = ["Todos", "Barbería", "Corte", "Spa", "Uñas", "Miraflores", "San Isidro"];

export function ExplorarView({ businesses }: { businesses: Business[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const handleQuickFilter = (tag: string) => {
    setActiveFilter(tag);
    if (tag === "Todos") {
      setSearchTerm("");
    } else {
      setSearchTerm(tag);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();

    const matchesName = b.name.toLowerCase().includes(term);
    const matchesDescription = b.description?.toLowerCase().includes(term) ?? false;
    const matchesAddress = b.address?.toLowerCase().includes(term) ?? false;
    const matchesService = b.services.some((s) => s.name.toLowerCase().includes(term));

    return matchesName || matchesDescription || matchesAddress || matchesService;
  });

  return (
    <div className="space-y-8">
      {/* Barra de búsqueda & Filtros rápidos */}
      <div className="space-y-4">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveFilter("");
            }}
            placeholder="Buscar por negocio, servicio o zona (ej. Barbería, Corte, Miraflores)..."
            className="w-full px-4 py-3.5 pl-11 pr-24 liquid-glass rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-sm transition-all"
          />
          <svg
            className="w-5 h-5 absolute left-3.5 top-3.5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("Todos");
              }}
              className="absolute right-3 top-2.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 bg-white/80 hover:bg-white rounded-xl border border-zinc-200 shadow-2xs transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Tags de búsqueda rápida */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 text-xs font-medium mr-1">Filtros rápidos:</span>
          {QUICK_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickFilter(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tag
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30"
                  : "liquid-glass-subtle border border-white/70 text-zinc-700 hover:text-violet-700 hover:border-violet-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas de Negocios */}
      {filteredBusinesses.length === 0 ? (
        <div className="liquid-glass rounded-3xl border border-white/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-tint text-violet-600 flex items-center justify-center mx-auto border border-violet-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-900">No encontramos coincidencias</h3>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            No se encontraron comercios ni servicios que coincidan con &ldquo;<strong>{searchTerm}</strong>&rdquo;. Intenta con otra palabra o restablece el buscador.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("Todos");
            }}
            className="btn-liquid-gradient inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            Ver todos los comercios
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((b) => {
            const hasServices = b.services.length > 0;
            const startingPrice = hasServices ? b.services[0].priceInCents : null;
            const firstLetter = b.name.charAt(0).toUpperCase();

            return (
              <div
                key={b.id}
                className="group liquid-glass rounded-3xl border border-white/80 overflow-hidden flex flex-col justify-between hover:border-violet-300 hover:shadow-xl hover:shadow-violet-900/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Encabezado con Avatar y Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform duration-200">
                        {firstLetter}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-zinc-950 group-hover:text-violet-900 leading-snug">
                          {b.name}
                        </h2>
                        {b.address && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate max-w-[170px] sm:max-w-[210px]">{b.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-xs px-2.5 py-0.5 liquid-glass-tint text-violet-900 rounded-full font-bold border border-violet-200/70 shadow-2xs">
                      {b.services.length} serv.
                    </span>
                  </div>

                  {/* Descripción del comercio */}
                  {b.description && (
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                      {b.description}
                    </p>
                  )}

                  {/* Lista limpia de servicios destacados con números tabulares */}
                  {hasServices && (
                    <div className="mt-4 pt-3.5 border-t border-zinc-100 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Servicios destacados
                      </div>
                      <div className="space-y-1.5">
                        {b.services.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className="flex justify-between items-center text-xs py-0.5"
                          >
                            <span className="text-zinc-700 font-medium truncate pr-2">
                              {s.name}
                            </span>
                            <span className="font-bold text-zinc-950 tabular-nums shrink-0">
                              {formatCurrency(s.priceInCents, s.currency)}
                            </span>
                          </div>
                        ))}
                        {b.services.length > 3 && (
                          <div className="text-xs text-zinc-400 pt-0.5 font-medium">
                            +{b.services.length - 3} servicios adicionales
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer de la tarjeta con precio base y botón */}
                <div className="px-6 py-4 liquid-glass-subtle border-t border-white/60 flex items-center justify-between gap-3">
                  <div>
                    {startingPrice !== null ? (
                      <div>
                        <span className="text-xs text-zinc-400 font-medium block">Tarifa desde</span>
                        <span className="text-sm font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent tabular-nums">
                          {formatCurrency(startingPrice, b.services[0]?.currency || "PEN")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">Sin tarifas</span>
                    )}
                  </div>

                  <Link
                    href={`/b/${b.slug}`}
                    className="btn-liquid-gradient inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                  >
                    <span>Ver y Reservar</span>
                    <svg className="w-3.5 h-3.5 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
