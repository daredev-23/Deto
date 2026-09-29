"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface ServiceData {
  id: string;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceInCents: number;
  currency: string;
}

interface BusinessData {
  id: string;
  name: string;
  slug: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface SlotData {
  startTime: string;
  endTime: string;
  timeString: string;
  available: boolean;
}

export function BookingForm({
  business,
  service,
  sessionUser,
  bookingUrl,
}: {
  business: BusinessData;
  service: ServiceData;
  sessionUser: SessionUser | null;
  bookingUrl: string;
}) {
  const router = useRouter();

  // Fecha por defecto (mañana)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(defaultDateStr);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Datos de contacto: autocompletados desde sessionUser si existen, y editables
  const [customerName, setCustomerName] = useState(sessionUser?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(sessionUser?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState(sessionUser?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"IN_PERSON" | "STRIPE">("IN_PERSON");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Consulta de disponibilidad
  useEffect(() => {
    async function fetchSlots() {
      setLoadingSlots(true);
      setErrorMessage(null);
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `/api/availability?slug=${business.slug}&serviceId=${service.id}&date=${selectedDate}`
        );
        const data = await res.json();

        if (res.ok && data.slots) {
          setSlots(data.slots);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate, business.slug, service.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage("Por favor selecciona un horario disponible.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: service.id,
          startTime: selectedSlot.startTime,
          customerName,
          customerEmail,
          customerPhone,
          notes,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "No se pudo completar la reserva.");
        setSubmitting(false);
        return;
      }

      // Si fue pago simulado con Stripe
      if (data.isSimulatedPayment) {
        router.push(
          `/b/${business.slug}/booking-success?bookingId=${data.booking.id}&simulatedPayment=true`
        );
        return;
      }

      // Si fue Stripe en vivo
      if (paymentMethod === "STRIPE" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Flujo estándar en el local
      router.push(`/b/${business.slug}/booking-success?bookingId=${data.booking.id}`);
    } catch (err) {
      console.error("Error submitting booking:", err);
      setErrorMessage("Error de conexión. Intenta nuevamente.");
      setSubmitting(false);
    }
  };

  // GATE: Si el usuario no ha iniciado sesión, requerir login o registro
  if (!sessionUser) {
    const loginTarget = `/login?callbackUrl=${encodeURIComponent(bookingUrl)}`;
    const registerTarget = `/register/client?callbackUrl=${encodeURIComponent(bookingUrl)}`;

    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-6">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-xl">
          🔒
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-950 mb-2">
            Inicia sesión o regístrate para reservar
          </h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Para garantizar tu cita, enviarte la confirmación por correo y registrarla en tu historial personal,
            necesitamos que accedas con tu cuenta de cliente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <Link
            href={loginTarget}
            className="w-full py-2.5 px-4 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 text-xs transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href={registerTarget}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-50 text-xs transition-colors"
          >
            Crear Cuenta Gratis
          </Link>
        </div>

        <div className="border-t border-gray-100 pt-4 text-[11px] text-gray-500">
          ¿Tienes un negocio propio?{" "}
          <Link href="/register" className="text-gray-900 underline font-medium">
            Regístralo como negocio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200">
      {/* Banner de sesión y autocompletado */}
      <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center justify-between gap-2">
        <div>
          ✓ Autenticado como <strong>{sessionUser.name}</strong> ({sessionUser.email}).
          <span className="text-emerald-700 block sm:inline sm:ml-1">
            Tus datos fueron cargados automáticamente.
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paso 1: Selección de Fecha */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            1. Selecciona la Fecha
          </label>
          <input
            type="date"
            required
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Paso 2: Selección de Horario */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            2. Selecciona un Horario Disponible
          </label>

          {loadingSlots ? (
            <p className="text-xs text-gray-500 py-3">Consultando disponibilidad...</p>
          ) : slots.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
              No hay horarios disponibles para esta fecha. Intenta con otro día.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.timeString === slot.timeString;
                return (
                  <button
                    key={slot.timeString}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 text-xs font-semibold rounded border transition-colors ${
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-800 border-gray-300 hover:border-gray-900"
                    }`}
                  >
                    {slot.timeString}
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              ✓ Horario seleccionado: {selectedSlot.timeString} hrs
            </p>
          )}
        </div>

        {/* Paso 3: Datos de Contacto (editables) */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-gray-900">
              3. Datos de la Cita (Editables)
            </label>
            <span className="text-[11px] text-gray-500">Puedes editar si reservas para otra persona</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="Nombre y apellido"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Correo Electrónico (para notificación) *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="+51 987 654 321"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notas adicionales (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="Indicaciones para el especialista"
              />
            </div>
          </div>
        </div>

        {/* Paso 4: Forma de Pago */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            4. Forma de Pago
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value="IN_PERSON"
                checked={paymentMethod === "IN_PERSON"}
                onChange={() => setPaymentMethod("IN_PERSON")}
                className="text-gray-900 focus:ring-gray-900"
              />
              <div>
                <span className="font-semibold text-gray-900">
                  Pago en el establecimiento (Recomendado)
                </span>
                <p className="text-xs text-gray-500">
                  Tu reserva queda confirmada al instante. Pagas en el local el día de tu cita.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value="STRIPE"
                checked={paymentMethod === "STRIPE"}
                onChange={() => setPaymentMethod("STRIPE")}
                className="text-gray-900 focus:ring-gray-900"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    Pagar en línea con tarjeta (Stripe)
                  </span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded font-semibold border border-amber-200">
                    Modo Demo / Simulación
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Si Stripe no cuenta con claves en .env, se simulará la confirmación de pago sin errores.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Resumen y Envío */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">Total a pagar:</div>
            <div className="text-xl font-bold text-gray-950">
              {formatCurrency(service.priceInCents, service.currency)}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm transition-all"
          >
            {submitting
              ? "Confirmando cita..."
              : paymentMethod === "STRIPE"
              ? "Ir a Pagar con Stripe"
              : "Confirmar Reserva"}
          </button>
        </div>
      </form>
    </div>
  );
}
