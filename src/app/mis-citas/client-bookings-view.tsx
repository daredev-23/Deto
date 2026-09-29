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

      // Revalidar el Server Component
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Próximas Citas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-950 text-sm">
            Próximas Citas ({upcoming.length})
          </h3>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            No tienes citas programadas próximamente.{" "}
            <Link href="/explorar" className="text-gray-900 font-semibold underline">
              Explorar catálogo de negocios
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{b.service.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600">
                    <strong>Negocio:</strong> {b.business.name}
                    {b.business.address && ` • ${b.business.address}`}
                  </div>

                  <div className="text-xs text-gray-600">
                    <strong>Especialista:</strong> {b.staffMember.name} •{" "}
                    <strong>Horario:</strong>{" "}
                    {formatDate(new Date(b.startTime))}, {formatTime(new Date(b.startTime))} hrs
                  </div>

                  <div className="text-xs text-gray-500 pt-1">
                    Total: <strong>{formatCurrency(b.totalAmountInCents, b.service.currency || "PEN")}</strong>{" "}
                    • {b.paymentMethod === "IN_PERSON" ? "Pago en el local" : "Pago en línea"}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/b/${b.business.slug}`}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium"
                  >
                    Ver Negocio
                  </Link>

                  <button
                    type="button"
                    disabled={cancelLoadingId === b.id}
                    onClick={() => handleCancelBooking(b.id)}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded text-xs font-semibold disabled:opacity-50"
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-950 text-sm">
            Historial de Citas Pasadas ({past.length})
          </h3>
        </div>

        {past.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            Aún no tienes citas en el historial anterior.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-medium">
              <tr>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Negocio</th>
                <th className="py-2.5 px-4">Servicio</th>
                <th className="py-2.5 px-4">Total</th>
                <th className="py-2.5 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {past.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-4 text-gray-700">
                    {formatDate(new Date(b.startTime))}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-gray-900">
                    {b.business.name}
                  </td>
                  <td className="py-2.5 px-4 text-gray-800">{b.service.name}</td>
                  <td className="py-2.5 px-4 font-semibold text-gray-900">
                    {formatCurrency(b.totalAmountInCents, b.service.currency || "PEN")}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : b.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
