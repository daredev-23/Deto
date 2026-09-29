import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, businessName, phone } = body;

    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { error: "Nombre, email, contraseña y nombre del negocio son obligatorios" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este correo electrónico" },
        { status: 409 }
      );
    }

    // Generate base slug
    let baseSlug = businessName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) baseSlug = "negocio";

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and business in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "BUSINESS_OWNER",
          phone: phone || null,
        },
      });

      const business = await tx.business.create({
        data: {
          ownerId: user.id,
          name: businessName,
          slug,
          phone: phone || null,
          timezone: "America/Lima",
          currency: "PEN",
        },
      });

      // V1 Default staff member: the owner!
      const defaultStaff = await tx.staffMember.create({
        data: {
          businessId: business.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isDefault: true,
          isActive: true,
        },
      });

      // Default service
      const sampleService = await tx.service.create({
        data: {
          businessId: business.id,
          name: "Servicio Inicial",
          description: "Servicio predeterminado de atención",
          durationMinutes: 30,
          bufferMinutes: 10,
          priceInCents: 3500, // S/ 35.00 PEN
          currency: "PEN",
          staffMembers: {
            connect: [{ id: defaultStaff.id }],
          },
        },
      });

      // Default schedules (Monday to Saturday: 09:00 - 18:00, Sunday closed)
      for (let day = 0; day <= 6; day++) {
        const isClosed = day === 0;
        await tx.businessSchedule.create({
          data: {
            businessId: business.id,
            dayOfWeek: day,
            openTime: "09:00",
            closeTime: "18:00",
            isClosed,
          },
        });

        await tx.staffSchedule.create({
          data: {
            staffMemberId: defaultStaff.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "18:00",
            breakStart: "14:00",
            breakEnd: "15:00",
            isWorking: !isClosed,
          },
        });
      }

      return { user, business, service: sampleService };
    });

    return NextResponse.json({
      success: true,
      message: "Negocio registrado exitosamente",
      businessSlug: result.business.slug,
    });
  } catch (error: any) {
    console.error("Error in registration:", error);
    return NextResponse.json({ error: "Error al registrar el negocio" }, { status: 500 });
  }
}
