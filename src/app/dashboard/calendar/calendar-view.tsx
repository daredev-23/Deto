"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface BookingItem {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  startTime: string;
  endTime: string;
  status: string;
  paymentMethod: string;
  totalAmountInCents: number;
  service: {
    name: string;
    currency: string;
  };
}

export function CalendarView({
  initialBookings,
}: {
  initialBookings: BookingItem[];
}) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        router.refresh();
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "ALL") return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filtros de estado ergonómicos en liquid glass */}
      <div className="flex flex-wrap items-center justify-between gap-4 liquid-glass p-5 rounded-3xl border border-white/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-zinc-700 mr-1">Filtrar estado:</span>
          {[
            { id: "ALL", label: "Todas" },
            { id: "CONFIRMED", label: "Confirmadas" },
            { id: "COMPLETED", label: "Completadas" },
            { id: "CANCELLED", label: "Canceladas" },
            { id: "NO_SHOW", label: "No asistió" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === item.id
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30"
                  : "liquid-glass-subtle border border-white/70 text-zinc-700 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold text-zinc-600 liquid-glass-subtle px-3 py-1.5 rounded-xl border border-white/80">
          {filteredBookings.length} cita(s) listadas
        </div>
      </div>

      {/* Lista / Tabla de Citas */}
      <div className="liquid-glass rounded-3xl border border-white/80 shadow-md overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500 space-y-1">
            <p className="font-bold text-zinc-800">No hay citas registradas</p>
            <p className="text-xs text-zinc-400">No se encontraron reservas con el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/60 text-zinc-600 border-b border-zinc-200/60 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Fecha y Horario</th>
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-5">Servicio</th>
                  <th className="py-3.5 px-5">Monto</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60">
                {filteredBookings.map((b) => {
                  const startDate = new Date(b.startTime);
                  const endDate = new Date(b.endTime);

                  return (
                    <tr key={b.id} className="hover:bg-white/40 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-zinc-900">
                        <div className="font-bold">{formatDate(startDate)}</div>
                        <div className="text-zinc-500 font-mono text-[11px] tabular-nums">
                          {formatTime(startDate)} - {formatTime(endDate)} hrs
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-zinc-900">{b.customerName}</div>
                        <div className="text-zinc-500">{b.customerEmail}</div>
                        {b.customerPhone && (
                          <div className="text-zinc-400 text-[11px]">{b.customerPhone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-zinc-800 font-medium">{b.service.name}</td>

                      <td className="py-3.5 px-5 font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent tabular-nums">
                        {formatCurrency(b.totalAmountInCents, b.service.currency)}
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            b.status === "CONFIRMED"
                              ? "bg-violet-50 text-violet-700 border-violet-200/70"
                              : b.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700 border-blue-200/70"
                              : b.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-700 border-rose-200/70"
                              : "bg-zinc-100 text-zinc-700 border-zinc-200/70"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {b.status === "CONFIRMED" && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === b.id}
                                onClick={() => handleStatusChange(b.id, "COMPLETED")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 liquid-glass-tint text-violet-950 hover:bg-violet-100 border border-violet-200/80 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Atendida</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === b.id}
                                onClick={() => handleStatusChange(b.id, "CANCELLED")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50/80 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Cancelar</span>
                              </button>
                            </>
                          )}
                          {b.status === "COMPLETED" && (
                            <span className="text-xs text-zinc-400 font-medium">Cita completada</span>
                          )}
                          {b.status === "CANCELLED" && (
                            <span className="text-xs text-zinc-400 font-medium">Turno cancelado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
