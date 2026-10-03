"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  bufferMinutes: number;
  priceInCents: number;
  currency: string;
  isActive: boolean;
}

export function ServicesManager({
  initialServices,
  businessId,
}: {
  initialServices: ServiceItem[];
  businessId: string;
}) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  // Estado para creación
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: "30",
    bufferMinutes: "5",
    priceInSoles: "35",
  });

  // Estado para edición inline
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    durationMinutes: string;
    bufferMinutes: string;
    priceInSoles: string;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Iniciar edición
  const startEdit = (s: ServiceItem) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      description: s.description || "",
      durationMinutes: s.durationMinutes.toString(),
      bufferMinutes: s.bufferMinutes.toString(),
      priceInSoles: (s.priceInCents / 100).toFixed(2),
    });
    setError(null);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Guardar edición
  const handleEditService = async (serviceId: string) => {
    if (!editForm) return;

    if (!editForm.name.trim()) {
      setError("El nombre del servicio es obligatorio.");
      return;
    }

    setEditLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el servicio.");
        return;
      }

      setServices((prev) =>
        prev.map((item) => (item.id === serviceId ? data.service : item))
      );
      setMessage("Servicio actualizado correctamente.");
      setEditingId(null);
      setEditForm(null);
      router.refresh();
    } catch {
      setError("Error de conexión al actualizar.");
    } finally {
      setEditLoading(false);
    }
  };

  // Pausar / Reactivar servicio
  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo cambiar el estado del servicio.");
        return;
      }

      setServices((prev) =>
        prev.map((item) => (item.id === serviceId ? { ...item, isActive: !currentActive } : item))
      );
      setMessage(
        !currentActive
          ? "Servicio reactivado para reservas públicas."
          : "Servicio pausado. Ya no aparecerá en el catálogo público."
      );
      router.refresh();
    } catch {
      setError("Error al cambiar estado del servicio.");
    }
  };

  // Eliminar servicio con protección de citas existentes
  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar o retirar "${serviceName}"?`)) {
      return;
    }

    setDeletingId(serviceId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar el servicio.");
        return;
      }

      if (data.action === "DEACTIVATED") {
        setServices((prev) =>
          prev.map((item) => (item.id === serviceId ? { ...item, isActive: false } : item))
        );
        setMessage(
          `"${serviceName}" tiene citas en el historial, por lo que fue desactivado protegiendo tus reportes contables.`
        );
      } else {
        setServices((prev) => prev.filter((item) => item.id !== serviceId));
        setMessage(`"${serviceName}" eliminado exitosamente.`);
      }
      router.refresh();
    } catch {
      setError("Error al procesar la eliminación.");
    } finally {
      setDeletingId(null);
    }
  };

  // Crear nuevo servicio
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el servicio");
        setLoading(false);
        return;
      }

      setServices((prev) => [...prev, data.service]);
      setShowAddForm(false);
      setMessage("Servicio creado exitosamente.");
      setForm({
        name: "",
        description: "",
        durationMinutes: "30",
        bufferMinutes: "5",
        priceInSoles: "35",
      });
      router.refresh();
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-950">Catálogo de Servicios</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Administra tarifas, duración, descansos y disponibilidad de tus servicios.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
            setMessage(null);
          }}
          className="btn-liquid-gradient inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showAddForm ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            )}
          </svg>
          <span>{showAddForm ? "Cerrar Formulario" : "Nuevo Servicio"}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-violet-50 text-violet-900 text-xs rounded-xl border border-violet-200/80 flex items-center gap-2">
          <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Formulario Crear */}
      {showAddForm && (
        <div className="liquid-glass p-6 sm:p-7 rounded-3xl border border-white/80 shadow-xl shadow-violet-900/5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xs shadow-violet-500/40" />
            <span>Agregar Nuevo Servicio</span>
          </h3>

          <form onSubmit={handleCreateService} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Corte de Cabello Estilo Libre"
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Precio (Soles PEN - S/) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={form.priceInSoles}
                  onChange={(e) => setForm({ ...form, priceInSoles: e.target.value })}
                  placeholder="35"
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all tabular-nums"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Duración (minutos) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all tabular-nums"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Buffer / Descanso posterior (min)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={form.bufferMinutes}
                  onChange={(e) => setForm({ ...form, bufferMinutes: e.target.value })}
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Detalles sobre lo que incluye el servicio..."
                className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-liquid-gradient inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold shadow-md shadow-violet-900/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Guardando..." : "Guardar Servicio"}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de servicios */}
      <div className="liquid-glass rounded-3xl border border-white/80 shadow-xl shadow-violet-900/5 overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500 space-y-1">
            <p className="font-bold text-zinc-800">Aún no has registrado servicios</p>
            <p className="text-xs text-zinc-400">Agrega tu primer servicio para que aparezca en tu catálogo público.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/60 text-zinc-600 border-b border-zinc-200/60 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Servicio</th>
                  <th className="py-3.5 px-5">Duración</th>
                  <th className="py-3.5 px-5">Buffer</th>
                  <th className="py-3.5 px-5">Precio</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-zinc-950">
                      <div className="font-bold">{s.name}</div>
                      {s.description && (
                        <div className="text-xs text-zinc-500 font-normal mt-0.5 line-clamp-1">{s.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-zinc-700 tabular-nums">{s.durationMinutes} min</td>
                    <td className="py-3.5 px-5 text-zinc-500 tabular-nums">
                      {s.bufferMinutes > 0 ? `${s.bufferMinutes} min` : "Sin buffer"}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-zinc-950 tabular-nums">
                      {formatCurrency(s.priceInCents, s.currency || "PEN")}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          s.isActive
                            ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-300/60"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200/70"
                        }`}
                      >
                        {s.isActive ? "Activo" : "Desactivado"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 liquid-glass-subtle text-violet-700 hover:bg-violet-100/60 border border-violet-200/70 rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-2xs cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(s.id, s.isActive)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border active:scale-95 transition-all shadow-2xs cursor-pointer ${
                            s.isActive
                              ? "liquid-glass-subtle text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                              : "liquid-glass-tint text-violet-700 border-violet-200 hover:bg-violet-100/60"
                          }`}
                        >
                          <span>{s.isActive ? "Pausar" : "Reactivar"}</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === s.id}
                          onClick={() => handleDeleteService(s.id, s.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 border border-rose-200 rounded-lg text-xs font-semibold disabled:opacity-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{deletingId === s.id ? "Eliminando..." : "Eliminar"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Panel de edición */}
      {editingId && editForm && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass rounded-3xl border border-white/90 p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-violet-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3">
              <h3 className="font-extrabold text-base text-zinc-950">Editar Servicio</h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-zinc-400 hover:text-zinc-700 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Precio (S/) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={editForm.priceInSoles}
                    onChange={(e) => setEditForm({ ...editForm, priceInSoles: e.target.value })}
                    className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Duración (min) *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={editForm.durationMinutes}
                    onChange={(e) => setEditForm({ ...editForm, durationMinutes: e.target.value })}
                    className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Buffer / Descanso posterior (min)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={editForm.bufferMinutes}
                  onChange={(e) => setEditForm({ ...editForm, bufferMinutes: e.target.value })}
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all tabular-nums"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 liquid-glass-subtle border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-200/50">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2.5 liquid-glass-subtle border border-zinc-200/80 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50/80 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={editLoading}
                onClick={() => handleEditService(editingId)}
                className="btn-liquid-gradient px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-violet-900/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {editLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
