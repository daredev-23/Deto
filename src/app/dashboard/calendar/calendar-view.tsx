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
    <div className="space-y-4">
      {/* Filtros de estado */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-gray-700">Filtrar por:</span>
          {["ALL", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === status
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "ALL" ? "Todos" : status}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          Mostrando {filteredBookings.length} cita(s)
        </div>
      </div>

      {/* Lista / Tabla de Citas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No se encontraron citas con el filtro seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Fecha y Horario</th>
                  <th className="py-2.5 px-4">Cliente</th>
                  <th className="py-2.5 px-4">Servicio</th>
                  <th className="py-2.5 px-4">Monto</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4 text-right">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => {
                  const startDate = new Date(b.startTime);
                  const endDate = new Date(b.endTime);

                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div>{formatDate(startDate)}</div>
                        <div className="text-gray-500">
                          {formatTime(startDate)} - {formatTime(endDate)} hrs
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{b.customerName}</div>
                        <div className="text-gray-500">{b.customerEmail}</div>
                        {b.customerPhone && (
                          <div className="text-gray-400">{b.customerPhone}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-gray-800">{b.service.name}</td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {formatCurrency(b.totalAmountInCents, b.service.currency)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : b.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        {b.status === "CONFIRMED" && (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === b.id}
                              onClick={() => handleStatusChange(b.id, "COMPLETED")}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px]"
                            >
                              ✓ Completar
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === b.id}
                              onClick={() => handleStatusChange(b.id, "CANCELLED")}
                              className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded font-medium text-[11px]"
                            >
                              ✕ Cancelar
                            </button>
                          </>
                        )}
                        {b.status === "COMPLETED" && (
                          <span className="text-[11px] text-gray-400">Atendida</span>
                        )}
                        {b.status === "CANCELLED" && (
                          <span className="text-[11px] text-gray-400">Cancelada</span>
                        )}
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
