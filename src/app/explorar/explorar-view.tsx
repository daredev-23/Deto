"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface ServiceSummary {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
  durationMinutes: number;
}

interface ScheduleSummary {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface StaffSummary {
  id: string;
  name: string;
}

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  services: ServiceSummary[];
  schedules: ScheduleSummary[];
  staffMembers: StaffSummary[];
}

const QUICK_FILTERS = ["Todos", "Barbería", "Corte", "Barba", "Miraflores"];

export function ExplorarView({ businesses }: { businesses: BusinessItem[] }) {
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
    if (!searchTerm.trim()) return true;
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
      <div className="space-y-3">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveFilter("");
            }}
            placeholder="Buscar por negocio, servicio o zona (ej. Barbería, Corte, Miraflores)..."
            className="w-full px-4 py-3.5 pl-11 pr-20 bg-white border border-zinc-200/90 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 shadow-xs transition-all"
          />
          <span className="absolute left-4 top-4 text-zinc-400 text-sm">🔍</span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("Todos");
              }}
              className="absolute right-3.5 top-3 px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Tags de búsqueda rápida */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-400 text-[11px] font-medium mr-1">Filtros rápidos:</span>
          {QUICK_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickFilter(tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeFilter === tag
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas de Negocios */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-3">
          <div className="text-3xl mb-1">🔍</div>
          <h3 className="text-base font-bold text-zinc-900">No encontramos coincidencias</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            No se encontraron comercios ni servicios que coincidan con "<strong>{searchTerm}</strong>". Intenta con otra palabra o restablece el buscador.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("Todos");
            }}
            className="mt-2 inline-flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
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
                className="group bg-white rounded-2xl border border-zinc-200/80 overflow-hidden flex flex-col justify-between hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-950/[0.04] transition-all duration-200"
              >
                <div className="p-6">
                  {/* Encabezado con Avatar y Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform duration-200">
                        {firstLetter}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-zinc-950 group-hover:text-zinc-900 leading-snug">
                          {b.name}
                        </h2>
                        {b.address && (
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                            <span className="text-zinc-400">📍</span>
                            <span className="truncate max-w-[170px] sm:max-w-[210px]">{b.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full font-bold border border-zinc-200/70">
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
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
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
                          <div className="text-[11px] text-zinc-400 pt-0.5 font-medium">
                            +{b.services.length - 3} servicios adicionales
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer de la tarjeta con precio base y botón */}
                <div className="px-6 py-4 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div>
                    {startingPrice !== null ? (
                      <div>
                        <span className="text-[10px] text-zinc-400 font-medium block">Tarifa desde</span>
                        <span className="text-xs font-bold text-zinc-950 tabular-nums">
                          {formatCurrency(startingPrice, b.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">Sin tarifas</span>
                    )}
                  </div>

                  <Link
                    href={`/b/${b.slug}`}
                    className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 shadow-2xs active:scale-[0.98] transition-all shrink-0"
                  >
                    Ver y Reservar →
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
