"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

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
      // Si el usuario venía intentando acceder a una URL específica (ej. agendar cita)
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
        router.refresh();
        return;
      }

      // De lo contrario, consultar la sesión para ver su rol
      const session = await getSession();
      const user = session?.user as any;

      if (user?.role === "BUSINESS_OWNER") {
        router.push("/dashboard");
      } else {
        // CLIENT va directamente al catálogo o a mis citas, NUNCA a la landing promocional
        router.push("/explorar");
      }
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Accede a tu cuenta de negocio o cuenta de cliente
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm transition-all"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
          <div>
            ¿Eres cliente y no tienes cuenta?{" "}
            <Link
              href={callbackUrl ? `/register/client?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register/client"}
              className="text-gray-900 font-semibold underline"
            >
              Regístrate aquí
            </Link>
          </div>
          <div className="text-gray-500">
            ¿Tienes un negocio?{" "}
            <Link href="/register" className="text-gray-800 font-semibold underline">
              Regístralo aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-500">
          Cargando formulario de inicio de sesión...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
