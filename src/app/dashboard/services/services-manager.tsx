"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  bufferMinutes: number;
  priceInCents: number;
  currency: string;
  isActive: boolean;
}

export function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceItem[];
}) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    durationMinutes: string;
    bufferMinutes: string;
    priceInSoles: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: "30",
    bufferMinutes: "5",
    priceInSoles: "35",
  });
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: String(service.durationMinutes),
      bufferMinutes: String(service.bufferMinutes),
      priceInSoles: (service.priceInCents / 100).toFixed(2),
    });
    setError(null);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditService = async (serviceId: string) => {
    if (!editForm) return;
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
        setError(data.error || "Error al actualizar el servicio");
        return;
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                name: editForm.name,
                description: editForm.description || null,
                durationMinutes: parseInt(editForm.durationMinutes),
                bufferMinutes: parseInt(editForm.bufferMinutes),
                priceInCents: Math.round(parseFloat(editForm.priceInSoles) * 100),
              }
            : s
        )
      );
      setEditingId(null);
      setEditForm(null);
      setMessage("Servicio actualizado correctamente.");
      router.refresh();
    } catch (err) {
      setError("Error de red al actualizar el servicio.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, isActive: !currentStatus } : s))
        );
        setMessage(currentStatus ? "Servicio pausado con éxito." : "Servicio activado con éxito.");
        router.refresh();
      }
    } catch (err) {
      console.error("Error toggling service status:", err);
      setError("No se pudo actualizar el estado del servicio.");
    }
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${serviceName}"?`)) {
      return;
    }

    setMessage(null);
    setError(null);
    setDeletingId(serviceId);

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al eliminar el servicio");
        return;
      }

      if (data.action === "DELETED") {
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
        setMessage("Servicio eliminado permanentemente.");
      } else if (data.action === "DEACTIVATED") {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, isActive: false } : s))
        );
        setMessage(data.message || "El servicio tiene citas en el historial y fue desactivado.");
      }
      router.refresh();
    } catch (err) {
      console.error("Error deleting service:", err);
      setError("Error de red al intentar eliminar el servicio.");
    } finally {
      setDeletingId(null);
    }
  };

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
    } catch (err) {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Catálogo de Servicios</h2>
          <p className="text-xs text-gray-500">
            Administra, edita, pausa o elimina los servicios de tu negocio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
            setMessage(null);
          }}
          className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800"
        >
          {showAddForm ? "Cerrar Formulario" : "+ Nuevo Servicio"}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Formulario Crear */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Agregar Nuevo Servicio</h3>

          <form onSubmit={handleCreateService} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Corte de Cabello Estilo Libre"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Precio (Soles PEN - S/) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={form.priceInSoles}
                  onChange={(e) => setForm({ ...form, priceInSoles: e.target.value })}
                  placeholder="35"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Duración (minutos) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Buffer / Descanso posterior (min)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={form.bufferMinutes}
                  onChange={(e) => setForm({ ...form, bufferMinutes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Detalles sobre lo que incluye el servicio..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-gray-900 text-white rounded font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Servicio"}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de servicios */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {services.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aún no has registrado servicios. Agrega el primero con el botón superior.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-medium">
              <tr>
                <th className="py-2.5 px-4">Servicio</th>
                <th className="py-2.5 px-4">Duración</th>
                <th className="py-2.5 px-4">Buffer</th>
                <th className="py-2.5 px-4">Precio</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <>
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div>{s.name}</div>
                      {s.description && (
                        <div className="text-[11px] text-gray-500 font-normal">{s.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{s.durationMinutes} min</td>
                    <td className="py-3 px-4 text-gray-500">
                      {s.bufferMinutes > 0 ? `${s.bufferMinutes} min` : "Sin buffer"}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {formatCurrency(s.priceInCents, s.currency || "PEN")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.isActive ? "Activo" : "Desactivado"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-[11px] font-medium"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(s.id, s.isActive)}
                        className={`px-2 py-1 rounded text-[11px] font-medium border ${
                          s.isActive
                            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {s.isActive ? "Pausar" : "Reactivar"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === s.id}
                        onClick={() => handleDeleteService(s.id, s.name)}
                        className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded text-[11px] font-medium disabled:opacity-50"
                      >
                        {deletingId === s.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </td>
                  </tr>

                  {/* Fila de edición inline */}
                  {editingId === s.id && editForm && (
                    <tr key={`edit-${s.id}`} className="bg-blue-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-blue-800 mb-2">Editando: {s.name}</p>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-700 font-medium mb-1">Nombre *</label>
                              <input
                                type="text"
                                required
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-medium mb-1">Precio (S/) *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.5"
                                value={editForm.priceInSoles}
                                onChange={(e) => setEditForm({ ...editForm, priceInSoles: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-medium mb-1">Duración (min) *</label>
                              <input
                                type="number"
                                required
                                min="5"
                                step="5"
                                value={editForm.durationMinutes}
                                onChange={(e) => setEditForm({ ...editForm, durationMinutes: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-medium mb-1">Buffer (min)</label>
                              <input
                                type="number"
                                min="0"
                                step="5"
                                value={editForm.bufferMinutes}
                                onChange={(e) => setEditForm({ ...editForm, bufferMinutes: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-gray-700 font-medium mb-1">Descripción</label>
                              <input
                                type="text"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Descripción opcional..."
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              disabled={editLoading}
                              onClick={() => handleEditService(s.id)}
                              className="px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-semibold hover:bg-blue-800 disabled:opacity-50"
                            >
                              {editLoading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
