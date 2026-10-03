"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  priceInCents: number;
  currency: string;
  durationMinutes: number;
  bufferMinutes: number;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  timeString: string;
  available: boolean;
  reason?: string;
}

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
}

export function BookingForm({
  business,
  service,
  sessionUser,
}: {
  business: Business;
  service: Service;
  sessionUser: SessionUser | null;
}) {
  const router = useRouter();

  // Fecha mínima seleccionable: hoy
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Datos de contacto: autocompletados desde sessionUser si existen, y editables
  const [customerName, setCustomerName] = useState(sessionUser?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(sessionUser?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState(sessionUser?.phone ?? "");
  const [notes, setNotes] = useState("");

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "No se pudo completar la reserva.");
        setSubmitting(false);
        return;
      }

      // Flujo estándar: confirmación directa
      router.push(`/b/${business.slug}/booking-success?bookingId=${data.booking.id}`);
    } catch (err) {
      console.error("Error submitting booking:", err);
      setErrorMessage("Error de conexión. Intenta nuevamente.");
      setSubmitting(false);
    }
  };

  const bookingUrl = `/b/${business.slug}/book/${service.id}`;

  // GATE: Si el usuario no ha iniciado sesión, requerir login o registro
  if (!sessionUser) {
    const loginTarget = `/login?callbackUrl=${encodeURIComponent(bookingUrl)}`;
    const registerTarget = `/register/client?callbackUrl=${encodeURIComponent(bookingUrl)}`;

    return (
      <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-xl shadow-violet-900/5 text-center space-y-6">
        <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-violet-500/30">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
            Inicia sesión o regístrate para reservar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Para garantizar tu turno y enviarte confirmación inmediata a tu correo, accede con tu cuenta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-sm mx-auto">
          <Link
            href={loginTarget}
            className="btn-liquid-gradient w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-white font-semibold rounded-xl text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Iniciar Sesión</span>
            <svg className="w-3.5 h-3.5 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href={registerTarget}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 liquid-glass-subtle border border-white/80 text-zinc-800 font-semibold rounded-xl hover:bg-white text-xs shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Crear Cuenta Gratis</span>
          </Link>
        </div>

        <div className="border-t border-zinc-200/60 pt-4 text-xs text-zinc-500">
          ¿Tienes un negocio propio?{" "}
          <Link href="/register" className="text-violet-700 underline font-semibold hover:text-violet-900">
            Regístralo como negocio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl shadow-violet-900/5">
      {/* Banner de sesión y autocompletado */}
      <div className="mb-8 p-4 liquid-glass-tint border border-violet-200/80 text-violet-950 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            Autenticado como <strong>{sessionUser.name}</strong> ({sessionUser.email}).
            <span className="text-violet-700 block sm:inline sm:ml-1 font-medium">
              Tus datos fueron cargados automáticamente.
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
          <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Paso 1: Selección de Fecha */}
        <div>
          <label className="block text-sm font-extrabold text-zinc-950 mb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">1</span>
            <span>Selecciona la Fecha</span>
          </label>
          <input
            type="date"
            required
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 liquid-glass rounded-2xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-xs transition-all"
          />
        </div>

        {/* Paso 2: Selección de Horario */}
        <div>
          <label className="block text-sm font-extrabold text-zinc-950 mb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">2</span>
            <span>Selecciona un Horario Disponible</span>
          </label>

          {loadingSlots ? (
            <div className="flex items-center gap-2.5 py-4 text-xs text-zinc-500 font-medium">
              <span className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <span>Consultando disponibilidad en vivo...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-4 liquid-glass-subtle rounded-2xl border border-white/80 text-xs text-zinc-600 leading-relaxed">
              No hay horarios disponibles para esta fecha. Intenta seleccionando otro día en el calendario.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.timeString === slot.timeString;
                return (
                  <button
                    key={slot.timeString}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-3 text-xs font-bold font-mono rounded-xl border tabular-nums transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/30 scale-[1.02]"
                        : "liquid-glass-subtle text-zinc-800 border-white/80 hover:border-violet-300 hover:text-violet-700 hover:bg-white shadow-2xs"
                    }`}
                  >
                    {slot.timeString}
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-3.5 p-3.5 liquid-glass-tint border border-violet-200/80 rounded-2xl text-xs font-semibold text-violet-950 flex items-center gap-2 shadow-xs">
              <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Horario seleccionado: <strong>{selectedSlot.timeString} hrs</strong></span>
            </div>
          )}
        </div>

        {/* Paso 3: Datos de Contacto (editables) */}
        <div className="space-y-4 pt-6 border-t border-zinc-200/60">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-extrabold text-zinc-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">3</span>
              <span>Datos de la Cita (Editables)</span>
            </label>
            <span className="text-xs text-zinc-400 font-medium">Puedes editar si reservas para otra persona</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="Nombre y apellido"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Correo Electrónico (para notificación) *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="+51 987 654 321"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Notas adicionales (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="Indicaciones para el especialista"
              />
            </div>
          </div>
        </div>

        {/* Paso 4: Forma de Pago */}
        <div className="pt-6 border-t border-zinc-200/60">
          <label className="block text-sm font-extrabold text-zinc-950 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">4</span>
            <span>Forma de Pago</span>
          </label>
          <div className="space-y-3">
            {/* Opción Activa: Pago en el establecimiento */}
            <label className="flex items-center gap-3.5 p-4 border-2 border-violet-400/60 liquid-glass-tint rounded-2xl cursor-pointer text-sm shadow-xs transition-all">
              <input
                type="radio"
                name="paymentMethod"
                value="IN_PERSON"
                checked={true}
                readOnly
                className="w-4 h-4 text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-zinc-950 text-sm">
                    Pago en el establecimiento
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full shadow-2xs">
                    Activo
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                  Tu reserva queda confirmada al instante. Pagas en el local el día de tu cita.
                </p>
              </div>
            </label>

            {/* Opción Bloqueada: Stripe en Beta */}
            <div className="flex items-center gap-3.5 p-4 border border-white/60 liquid-glass-subtle rounded-2xl opacity-60 cursor-not-allowed select-none text-sm">
              <input
                type="radio"
                name="paymentMethod"
                disabled
                className="w-4 h-4 text-zinc-400 cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-zinc-600 text-sm">
                    Pagar en línea con tarjeta (Stripe)
                  </span>
                  <span className="px-2.5 py-0.5 bg-zinc-200/90 text-zinc-700 text-[10px] font-bold rounded-full border border-zinc-300">
                    Próximamente / Beta
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Próximamente disponible para pagos seguros con tarjeta en línea.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen y Envío */}
        <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-zinc-500 font-medium">Total a pagar en el local:</div>
            <div className="text-2xl font-black bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent tabular-nums">
              {formatCurrency(service.priceInCents, service.currency)}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="btn-liquid-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 text-white font-bold rounded-xl disabled:opacity-50 text-sm shadow-lg shadow-violet-600/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirmando cita...</span>
              </>
            ) : (
              <>
                <span>Confirmar Reserva</span>
                <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
