import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookingForm } from "./booking-form";

export default async function BookServicePage({
  params,
}: {
  params: { slug: string; serviceId: string };
}) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
  });

  if (!business) {
    notFound();
  }

  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
  });

  if (!service || !service.isActive || service.businessId !== business.id) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const sessionUser = (session?.user as any) ?? null;
  const isOwner = sessionUser?.role === "BUSINESS_OWNER";

  return (
    <div className="min-h-screen bg-transparent py-10 md:py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <Link
            href={`/b/${business.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-violet-700 transition-colors liquid-glass-subtle px-3.5 py-1.5 rounded-xl border border-white/80 shadow-2xs mb-4 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a {business.name}</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold liquid-glass-tint text-violet-950 border border-violet-200/80 shadow-2xs">
              Paso Final
            </span>
            <span className="text-xs text-zinc-400 font-medium">•</span>
            <span className="text-xs text-zinc-500 font-medium">
              Duración: {service.durationMinutes} min {service.bufferMinutes > 0 && `(+${service.bufferMinutes} min intervalo)`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Agendar: {service.name}
          </h1>
        </div>

        {isOwner ? (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-7 text-center space-y-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold text-sm">
              !
            </div>
            <div className="text-amber-900 font-extrabold text-sm">
              Estás conectado como Dueño de Negocio ({sessionUser.name})
            </div>
            <p className="text-xs text-amber-800/90 max-w-md mx-auto leading-relaxed">
              Esta pantalla de reserva está optimizada para clientes. Si deseas agendar una cita como cliente particular, inicia sesión con tu cuenta de cliente.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                Ir a mi Dashboard
              </Link>
              <Link
                href={`/b/${business.slug}`}
                className="px-5 py-2.5 bg-white border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-all"
              >
                Ver perfil público
              </Link>
            </div>
          </div>
        ) : (
          <BookingForm
            business={{
              id: business.id,
              name: business.name,
              slug: business.slug,
            }}
            service={{
              id: service.id,
              name: service.name,
              durationMinutes: service.durationMinutes,
              bufferMinutes: service.bufferMinutes,
              priceInCents: service.priceInCents,
              currency: service.currency,
            }}
            sessionUser={
              sessionUser && sessionUser.role === "CLIENT"
                ? {
                    id: sessionUser.id,
                    name: sessionUser.name ?? "",
                    email: sessionUser.email ?? "",
                    phone: sessionUser.phone ?? "",
                  }
                : null
            }
          />
        )}
      </div>
    </div>
  );
}
