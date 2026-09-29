"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function RegisterClientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ocurrió un error al registrar");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const signRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signRes?.ok) {
        if (callbackUrl) {
          router.push(decodeURIComponent(callbackUrl));
        } else {
          router.push("/explorar");
        }
        router.refresh();
      } else {
        router.push(callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Crear Cuenta de Cliente
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Registra tu cuenta para agendar citas, consultar tu historial y recibir confirmaciones
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Ej. Ana Martínez"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Teléfono (opcional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="+51 987 654 321"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Contraseña *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm transition-all"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
          <div>
            ¿Ya tienes cuenta?{" "}
            <Link
              href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
              className="text-gray-900 font-semibold underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
          <div className="text-gray-500">
            ¿Tienes un negocio?{" "}
            <Link href="/register" className="text-gray-800 font-semibold underline">
              Regístralo como negocio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterClientPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-500">
          Cargando registro de cliente...
        </div>
      }
    >
      <RegisterClientForm />
    </Suspense>
  );
}
