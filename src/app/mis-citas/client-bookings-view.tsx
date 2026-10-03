"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

interface BookingRecord {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmountInCents: number;
  business: {
    name: string;
    slug: string;
    phone?: string | null;
    address?: string | null;
  };
  service: {
    name: string;
    durationMinutes: number;
    currency: string;
  };
  staffMember: {
    name: string;
  };
}

export function ClientBookingsView({
  upcoming,
  past,
}: {
  upcoming: BookingRecord[];
  past: BookingRecord[];
}) {
  const router = useRouter();
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("¿Deseas cancelar esta cita?")) {
      return;
    }

    setCancelLoadingId(bookingId);
    setError(null);
    try {
      const res = await fetch(`/api/client/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo cancelar la cita");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("Error cancelling:", err);
      setError("Error al cancelar la cita");
    } finally {
      setCancelLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Próximas Citas */}
      <div className="liquid-glass rounded-3xl border border-white/80 shadow-md overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xs shadow-violet-500/50" />
            <h2 className="font-extrabold text-zinc-950 text-base">
              Próximas Citas
            </h2>
          </div>
          <span className="text-xs font-bold text-violet-950 liquid-glass-tint px-3 py-1 rounded-full border border-violet-200/80 shadow-2xs">
            {upcoming.length} activas
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl liquid-glass-tint text-violet-600 flex items-center justify-center mx-auto border border-violet-200/80 shadow-2xs">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-zinc-500">No tienes citas programadas para los próximos días.</p>
            <Link
              href="/explorar"
              className="btn-liquid-gradient inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explorar catálogo de negocios</span>
              <svg className="w-3.5 h-3.5 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/60">
            {upcoming.map((b) => (
              <div key={b.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-white/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-base text-zinc-950">{b.service.name}</span>
                    <span className="text-xs px-2.5 py-0.5 liquid-glass-tint text-violet-950 border border-violet-200/80 rounded-full font-bold shadow-2xs">
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 flex items-center gap-1.5">
                    <strong className="text-zinc-800">Negocio:</strong> {b.business.name}
                    {b.business.address && <span className="text-zinc-400">• {b.business.address}</span>}
                  </div>

                  <div className="text-xs text-zinc-600 flex items-center gap-1.5">
                    <strong className="text-zinc-800">Especialista:</strong> {b.staffMember.name}
                    <span className="text-zinc-400">•</span>
                    <strong className="text-zinc-800">Horario:</strong>
                    <span className="tabular-nums font-semibold text-zinc-900">
                      {formatDate(new Date(b.startTime))}, {formatTime(new Date(b.startTime))} hrs
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 pt-1 flex items-center gap-2">
                    <span>Total:</span>
                    <strong className="bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent font-bold tabular-nums">
                      {formatCurrency(b.totalAmountInCents, b.service.currency || "PEN")}
                    </strong>
                    <span className="text-zinc-400">•</span>
                    <span className="text-violet-700 font-medium">Pago en el establecimiento</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  <Link
                    href={`/b/${b.business.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 liquid-glass-subtle border border-white/80 text-zinc-700 hover:text-violet-700 hover:border-violet-200 rounded-xl text-xs font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Ver Negocio</span>
                  </Link>

                  <button
                    type="button"
                    disabled={cancelLoadingId === b.id}
                    onClick={() => handleCancelBooking(b.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50/80 border border-rose-200/80 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {cancelLoadingId === b.id ? "Cancelando..." : "Cancelar Cita"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Citas Pasadas */}
      <div className="liquid-glass rounded-3xl border border-white/80 shadow-md overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-200/60 flex items-center justify-between">
          <h2 className="font-extrabold text-zinc-950 text-base">
            Historial de Citas Pasadas
          </h2>
          <span className="text-xs font-semibold text-zinc-400">
            {past.length} registros
          </span>
        </div>

        {past.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Aún no tienes citas en el historial anterior.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-600 border-b border-zinc-200/80 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Fecha</th>
                  <th className="py-3.5 px-5">Negocio</th>
                  <th className="py-3.5 px-5">Servicio</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {past.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-zinc-700 font-medium">
                      {formatDate(new Date(b.startTime))}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-zinc-900">
                      {b.business.name}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-800">{b.service.name}</td>
                    <td className="py-3.5 px-5 font-bold text-zinc-950 tabular-nums">
                      {formatCurrency(b.totalAmountInCents, b.service.currency || "PEN")}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          b.status === "COMPLETED"
                            ? "bg-violet-50 text-violet-700 border-violet-200/70"
                            : b.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200/70"
                            : "bg-zinc-100 text-zinc-700 border-zinc-200/70"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
