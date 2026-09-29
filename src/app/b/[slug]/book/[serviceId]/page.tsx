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
  const sessionUser = session?.user as any ?? null;
  const isOwner = sessionUser?.role === "BUSINESS_OWNER";
  const bookingUrl = `/b/${business.slug}/book/${service.id}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href={`/b/${business.slug}`}
          className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-3"
        >
          ← Volver a {business.name}
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-950 tracking-tight">
          Agendar Cita: {service.name}
        </h1>
        <p className="text-sm text-gray-600">
          Duración: {service.durationMinutes} minutos {service.bufferMinutes > 0 && `(+${service.bufferMinutes} min intervalo)`}
        </p>
      </div>

      {isOwner ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
          <div className="text-amber-800 font-bold text-sm">
            Estás conectado como Propietario de Negocio ({sessionUser.name})
          </div>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Esta vista de reserva está diseñada para clientes. Si deseas agendar una cita como cliente, inicia sesión con tu cuenta personal de cliente.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-amber-800 text-white rounded-md text-xs font-semibold hover:bg-amber-900"
            >
              Ir a mi Dashboard
            </Link>
            <Link
              href={`/b/${business.slug}`}
              className="px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-md text-xs font-semibold hover:bg-amber-100"
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
          bookingUrl={bookingUrl}
        />
      )}
    </div>
  );
}
