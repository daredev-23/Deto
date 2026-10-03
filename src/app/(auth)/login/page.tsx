"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialView = searchParams.get("view") === "register" ? "welcome" : "login";

  const [view, setView] = useState<"login" | "welcome">(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      setLoading(false);
      return;
    }

    if (res?.ok) {
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
        router.refresh();
        return;
      }

      const session = await getSession();
      const user = session?.user as any;

      if (user?.role === "BUSINESS_OWNER") {
        router.push("/dashboard");
      } else {
        router.push("/explorar");
      }
      router.refresh();
    }
  };

  const clientRegisterUrl = callbackUrl
    ? `/register/client?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/register/client";

  return (
    <div className="min-h-screen bg-transparent py-12 md:py-16">
      <div className="max-w-lg mx-auto px-4">
        {view === "login" ? (
          /* VISTA 1: Formulario de Inicio de Sesión */
          <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl shadow-violet-900/10 transition-all">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 mb-2 shadow-2xs">
                Acceso a la plataforma
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
                Iniciar Sesión
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Ingresa tus credenciales para acceder a tu cuenta
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
                <label className="block text-zinc-800 text-xs font-semibold mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <label className="block text-zinc-800 text-xs font-semibold mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 liquid-glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 shadow-2xs transition-all"
                  placeholder="••••••••"
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
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Opciones de creación de cuenta */}
            <div className="mt-8 pt-5 border-t border-zinc-200/60 text-center">
              <p className="text-xs text-zinc-600">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setView("welcome")}
                  className="font-bold text-violet-700 underline hover:text-violet-900 transition-colors cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* VISTA 2: Tarjeta de Bienvenida y Selección de Tipo de Cuenta */
          <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl shadow-violet-900/10 transition-all space-y-6">
            {/* Cabecera con mensaje de bienvenida y frase de promoción */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 shadow-2xs">
                <span>✦</span>
                <span>¡Bienvenido a Deto!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
                Elige cómo deseas empezar
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                La plataforma más ágil para descubrir servicios y gestionar reservas sin llamadas ni complicaciones.
              </p>
            </div>

            {/* Las 2 opciones con iconos vectoriales SVG limpios */}
            <div className="grid gap-3.5 pt-2">
              {/* Opción 1: Reservar Servicios */}
              <Link
                href={clientRegisterUrl}
                className="group block p-5 liquid-glass-subtle border-2 border-white/80 hover:border-violet-400 rounded-3xl hover:shadow-xl hover:shadow-violet-900/5 transition-all text-left shadow-xs"
              >
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <span className="font-extrabold text-base text-zinc-950 group-hover:text-violet-700 transition-colors block">
                        Reservar Servicios
                      </span>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Explora salones, barberías y especialistas. Agenda tus citas online en segundos y consulta tu historial.
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>

              {/* Opción 2: Ofrece tus Servicios */}
              <Link
                href="/register"
                className="group block p-5 liquid-glass-subtle border-2 border-white/80 hover:border-violet-400 rounded-3xl hover:shadow-xl hover:shadow-violet-900/5 transition-all text-left shadow-xs"
              >
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <span className="font-extrabold text-base text-zinc-950 group-hover:text-violet-700 transition-colors block">
                        Ofrece tus Servicios
                      </span>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Publica tus horarios, recibe reservas automáticas, cobra en tu local y administra tu agenda profesional.
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Botón para volver al login */}
            <div className="pt-3 border-t border-zinc-200/60 text-center">
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-xs font-semibold text-zinc-600 hover:text-violet-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>¿Ya tienes una cuenta? Iniciar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-zinc-500">
          Cargando formulario de acceso...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
