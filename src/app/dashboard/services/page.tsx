import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ServicesManager } from "./services-manager";

export default async function DashboardServicesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    return <div>No se encontró negocio para este usuario.</div>;
  }

  const rawServices = await prisma.service.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });

  const services = rawServices.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    bufferMinutes: s.bufferMinutes,
    priceInCents: s.priceInCents,
    currency: s.currency,
    isActive: s.isActive,
  }));

  return <ServicesManager initialServices={services} businessId={business.id} />;
}
