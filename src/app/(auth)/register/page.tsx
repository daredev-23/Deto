"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
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
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Registrar Negocio
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Crea tu cuenta de propietario y configura tu negocio en minutos
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Nombre Completo (Propietario / Profesional)
            </label>
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
            <label className="block text-gray-700 font-medium mb-1">
              Nombre de tu Negocio
            </label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Ej. Estudio Estética Glow"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="contacto@negocio.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contraseña
            </label>
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
            className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta & Empezar"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
          <div>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-gray-900 font-semibold underline">
              Inicia sesión aquí
            </Link>
          </div>
          <div className="text-gray-500">
            ¿Eres cliente y quieres agendar?{" "}
            <Link href="/register/client" className="text-gray-800 font-semibold underline">
              Crea tu cuenta de cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
