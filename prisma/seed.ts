import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed para Deto...");

  // Limpiar datos existentes en cascada
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.staffSchedule.deleteMany();
  await prisma.businessSchedule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear Usuario Propietario
  const passwordHash = await bcrypt.hash("password123", 10);
  const owner = await prisma.user.create({
    data: {
      email: "demo@deto.test",
      passwordHash,
      name: "Carlos Gómez",
      role: "BUSINESS_OWNER",
      phone: "+51 987 654 321",
    },
  });

  // 2. Crear Usuario Cliente Demo
  const clientPasswordHash = await bcrypt.hash("cliente123", 10);
  const clientUser = await prisma.user.create({
    data: {
      email: "cliente@deto.test",
      passwordHash: clientPasswordHash,
      name: "Ana Clientes",
      role: "CLIENT",
      phone: "+51 999 888 777",
    },
  });

  // 3. Crear Negocio
  const business = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Barbería Deto",
      slug: "barberia-deto",
      description:
        "Estilo, precisión y cuidado personal para caballeros. Cortes clásicos y modernos, toalla caliente y afeitado tradicional.",
      phone: "+51 987 654 321",
      address: "Av. Larco 456, Miraflores, Lima",
      timezone: "America/Lima",
      currency: "PEN",
    },
  });

  // 4. Crear Especialista por Defecto (El mismo propietario en V1)
  const defaultStaff = await prisma.staffMember.create({
    data: {
      businessId: business.id,
      userId: owner.id,
      name: "Carlos Gómez",
      email: "demo@deto.test",
      phone: "+51 987 654 321",
      isDefault: true,
      isActive: true,
    },
  });

  // 5. Crear Servicios del Negocio (Precios en Soles PEN)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        businessId: business.id,
        name: "Corte de Cabello Clásico",
        description: "Corte a tijera o máquina, lavado y peinado con producto profesional.",
        durationMinutes: 35,
        bufferMinutes: 10,
        priceInCents: 3500, // S/ 35.00 PEN
        currency: "PEN",
        staffMembers: {
          connect: [{ id: defaultStaff.id }],
        },
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: "Perfilado de Barba & Toalla Caliente",
        description: "Ritual tradicional con toalla caliente, aceite de barba y navaja libre.",
        durationMinutes: 25,
        bufferMinutes: 5,
        priceInCents: 2500, // S/ 25.00 PEN
        currency: "PEN",
        staffMembers: {
          connect: [{ id: defaultStaff.id }],
        },
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: "Combo Corte + Barba Completo",
        description: "Servicio integral de corte, diseño de barba y tratamiento facial express.",
        durationMinutes: 60,
        bufferMinutes: 15,
        priceInCents: 5500, // S/ 55.00 PEN
        currency: "PEN",
        staffMembers: {
          connect: [{ id: defaultStaff.id }],
        },
      },
    }),
  ]);

  // 6. Configurar Horarios del Negocio (Lunes a Sábado: 09:00 a 19:00, Domingo cerrado)
  const days = [0, 1, 2, 3, 4, 5, 6];
  for (const day of days) {
    const isClosed = day === 0; // Domingo cerrado
    await prisma.businessSchedule.create({
      data: {
        businessId: business.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "19:00",
        isClosed,
      },
    });

    // Horarios del especialista con descanso de 14:00 a 15:00
    await prisma.staffSchedule.create({
      data: {
        staffMemberId: defaultStaff.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "19:00",
        breakStart: "14:00",
        breakEnd: "15:00",
        isWorking: !isClosed,
      },
    });
  }

  // 7. Cita de prueba para mañana a las 11:00 AM (vinculada al cliente demo)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrow.getMinutes() + services[0].durationMinutes);

  await prisma.booking.create({
    data: {
      businessId: business.id,
      serviceId: services[0].id,
      staffMemberId: defaultStaff.id,
      customerId: clientUser.id, // Vinculada al cliente demo
      customerName: "Ana Clientes",
      customerEmail: "cliente@deto.test",
      customerPhone: "+51 999 888 777",
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: "CONFIRMED",
      paymentMethod: "IN_PERSON",
      paymentStatus: "PENDING",
      totalAmountInCents: services[0].priceInCents,
      notes: "Reserva demo del cliente",
    },
  });

  console.log("✅ Seed completado con éxito:");
  console.log(" - Negocio:", business.name, `(/b/${business.slug})`);
  console.log(" - Usuario Propietario: demo@deto.test       (password123)");
  console.log(" - Usuario Cliente:     cliente@deto.test    (cliente123)");
  console.log(" - Servicios creados:", services.length);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
