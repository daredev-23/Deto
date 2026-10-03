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
    <div className="min-h-screen bg-transparent py-12 md:py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl shadow-violet-900/10">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 mb-2 shadow-2xs">
              Cuenta Personal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              Crear Cuenta de Cliente
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Registra tu cuenta para agendar citas, ver tu historial y recibir confirmaciones
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-zinc-800 text-xs font-semibold mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="Ej. Ana Martínez"
              />
            </div>

            <div>
              <label className="block text-zinc-800 text-xs font-semibold mb-1">Correo Electrónico *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-zinc-800 text-xs font-semibold mb-1">Teléfono (opcional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="+51 987 654 321"
              />
            </div>

            <div>
              <label className="block text-zinc-800 text-xs font-semibold mb-1">Contraseña *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-liquid-gradient w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 mt-2 text-white font-semibold rounded-xl disabled:opacity-50 text-sm shadow-md shadow-violet-600/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-zinc-200/60 text-center text-xs text-zinc-600 space-y-2">
            <div>
              ¿Ya tienes cuenta?{" "}
              <Link
                href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
                className="text-violet-700 font-semibold underline hover:text-violet-900"
              >
                Inicia sesión aquí
              </Link>
            </div>
            <div className="text-zinc-500">
              ¿Tienes un negocio?{" "}
              <Link href="/register" className="text-zinc-800 font-semibold underline hover:text-violet-700">
                Regístralo como negocio
              </Link>
            </div>
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
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-zinc-500">
          Cargando registro de cliente...
        </div>
      }
    >
      <RegisterClientForm />
    </Suspense>
  );
}
