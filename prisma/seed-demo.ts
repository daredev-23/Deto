/**
 * Seed de demostración para Deto: 15 negocios de Lima con dueños, especialistas,
 * servicios, horarios, 20 clientes, reservas y pagos.
 *
 * Uso (desde la carpeta del proyecto, con las tablas ya creadas):
 *   pnpm tsx prisma/seed-demo.ts
 *
 * Necesita DEMO_PASSWORD en el .env (mínimo 8 caracteres).
 * Si la base ya tiene negocios o cuentas @deto.test, se detiene sin tocar nada.
 * Con FORCE_SEED=1 borra SOLO los datos demo (cuentas @deto.test y sus negocios)
 * y vuelve a crearlos. Nunca toca cuentas con otro dominio.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

try {
  (process as any).loadEnvFile?.(".env");
} catch {
  /* si no hay .env, se usan las variables del sistema */
}

const prisma = new PrismaClient();

// ---------- Aleatoriedad repetible (mismo resultado en cada corrida) ----------
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261003);
const int = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;
const phone = () => `+51 9${int(10, 99)} ${int(100, 999)} ${int(100, 999)}`;

// ---------- Fechas en hora de Lima (UTC-5, sin horario de verano) ----------
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const nowLima = new Date(Date.now() - 5 * 3600000);
const today = new Date(
  Date.UTC(nowLima.getUTCFullYear(), nowLima.getUTCMonth(), nowLima.getUTCDate())
);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
// minuto del día en Lima -> instante real (UTC)
const at = (day: Date, minutes: number) =>
  new Date(day.getTime() + (minutes + 300) * 60000);

// ---------- Datos de los negocios ----------
type Svc = [name: string, desc: string, minutes: number, buffer: number, soles: number];
type Biz = {
  name: string;
  slug: string;
  desc: string;
  address: string;
  staff: string[]; // el primero es el dueño
  open: string;
  close: string;
  satClose?: string;
  closedDays: number[]; // 0 = domingo
  lunch: [string, string] | null;
  services: Svc[];
};

const BUSINESSES: Biz[] = [
  {
    name: "Barbería El Corte Fino",
    slug: "el-corte-fino",
    desc: "Cortes clásicos y modernos, perfilado de barba y atención puntual en el corazón de Miraflores.",
    address: "Av. Larco 1120, Miraflores",
    staff: ["Rodrigo Salinas", "Jhon Paredes"],
    open: "09:00", close: "20:00", closedDays: [0], lunch: ["14:00", "15:00"],
    services: [
      ["Corte clásico", "Corte a tijera o máquina con lavado y peinado.", 35, 5, 35],
      ["Corte + barba", "Corte completo y perfilado de barba con toalla caliente.", 60, 10, 55],
      ["Perfilado de barba", "Diseño y perfilado con navaja.", 25, 5, 25],
      ["Corte infantil", "Corte para niños hasta 12 años.", 30, 5, 25],
    ],
  },
  {
    name: "Salón Lúcida",
    slug: "salon-lucida",
    desc: "Salón de belleza integral: color, tratamientos capilares y peinados para toda ocasión.",
    address: "Av. Camino Real 390, San Isidro",
    staff: ["Mariana Echevarría", "Paola Linares", "Gisela Montoya"],
    open: "10:00", close: "20:00", closedDays: [], lunch: ["15:00", "16:00"],
    services: [
      ["Corte y peinado", "Corte personalizado con lavado y secado.", 60, 10, 80],
      ["Tinte completo", "Coloración de todo el cabello.", 150, 15, 180],
      ["Mechas balayage", "Técnica de iluminación natural.", 180, 15, 320],
      ["Tratamiento de keratina", "Alisado y nutrición profunda.", 120, 10, 220],
      ["Peinado para evento", "Peinado para bodas y fiestas.", 60, 10, 90],
    ],
  },
  {
    name: "Spa Raíces Andinas",
    slug: "spa-raices-andinas",
    desc: "Masajes y rituales de bienestar inspirados en la tradición andina, a pasos del malecón de Barranco.",
    address: "Jr. Domeyer 280, Barranco",
    staff: ["Elena Quispe", "Tomás Rivera"],
    open: "10:00", close: "21:00", closedDays: [], lunch: null,
    services: [
      ["Masaje relajante", "Masaje de cuerpo completo con aceites esenciales.", 60, 15, 120],
      ["Masaje descontracturante", "Trabajo profundo en espalda y cuello.", 60, 15, 140],
      ["Piedras calientes", "Terapia con piedras volcánicas.", 75, 15, 170],
      ["Facial hidratante", "Limpieza e hidratación profunda.", 50, 10, 110],
      ["Día de spa", "Masaje, facial y baño de vapor.", 150, 20, 320],
    ],
  },
  {
    name: "Uñas Luna Studio",
    slug: "unas-luna-studio",
    desc: "Manicure, pedicure y diseños de uñas con productos de calidad profesional.",
    address: "Av. Primavera 1850, Santiago de Surco",
    staff: ["Karla Benites", "Stephany Cruz"],
    open: "10:00", close: "19:00", closedDays: [0], lunch: ["14:00", "14:45"],
    services: [
      ["Manicure clásica", "Limpieza, limado y esmaltado.", 45, 5, 30],
      ["Manicure en gel", "Esmaltado semipermanente de larga duración.", 60, 10, 55],
      ["Pedicure spa", "Exfoliación, masaje y esmaltado.", 70, 10, 60],
      ["Uñas acrílicas", "Aplicación completa de acrílico.", 100, 10, 110],
      ["Retiro y diseño", "Retiro del material anterior y nuevo diseño.", 40, 5, 35],
    ],
  },
  {
    name: "Veterinaria Patitas Felices",
    slug: "veterinaria-patitas-felices",
    desc: "Atención veterinaria para perros y gatos: consultas, vacunas y control de cachorros.",
    address: "Av. Raúl Ferrero 1020, La Molina",
    staff: ["Dr. Ricardo Lazo", "Dra. Andrea Fuentes"],
    open: "09:00", close: "19:00", satClose: "14:00", closedDays: [0], lunch: ["13:00", "14:00"],
    services: [
      ["Consulta general", "Revisión completa de tu mascota.", 30, 10, 60],
      ["Vacunación", "Aplicación de vacunas según calendario.", 20, 5, 50],
      ["Desparasitación", "Tratamiento interno y externo.", 20, 5, 35],
      ["Baño medicado", "Baño con productos veterinarios.", 60, 10, 70],
      ["Control de cachorro", "Seguimiento de crecimiento y nutrición.", 30, 5, 55],
    ],
  },
  {
    name: "Clínica Dental Sonrisa Plena",
    slug: "dental-sonrisa-plena",
    desc: "Odontología general y estética con atención personalizada para toda la familia.",
    address: "Av. San Luis 2060, San Borja",
    staff: ["Dra. Lucía Montenegro", "Dr. Héctor Alva"],
    open: "09:00", close: "19:00", satClose: "13:00", closedDays: [0], lunch: ["13:00", "14:00"],
    services: [
      ["Consulta y diagnóstico", "Evaluación inicial y plan de tratamiento.", 30, 5, 50],
      ["Limpieza dental", "Profilaxis y control de sarro.", 45, 10, 90],
      ["Blanqueamiento dental", "Aclaramiento en consultorio.", 60, 10, 350],
      ["Curación (empaste)", "Tratamiento de caries con resina.", 45, 10, 120],
      ["Control de ortodoncia", "Revisión y ajuste de brackets.", 30, 5, 100],
    ],
  },
  {
    name: "Barbería Don Lucho",
    slug: "barberia-don-lucho",
    desc: "Barbería de barrio con precios justos, abierta toda la semana.",
    address: "Av. Alfredo Mendiola 3560, Los Olivos",
    staff: ["Luis Condori", "Piero Ayala", "Kevin Soto"],
    open: "09:00", close: "21:00", closedDays: [], lunch: ["14:00", "15:00"],
    services: [
      ["Corte degradé", "Corte moderno con degradado.", 40, 5, 20],
      ["Corte + cejas", "Corte y perfilado de cejas.", 45, 5, 25],
      ["Barba completa", "Arreglo y perfilado de barba.", 30, 5, 15],
      ["Corte + barba", "Servicio completo.", 60, 10, 32],
    ],
  },
  {
    name: "Peluquería Estilo & Color",
    slug: "estilo-y-color",
    desc: "Peluquería para damas: cortes, color y tratamientos en Jesús María.",
    address: "Av. Brasil 2480, Jesús María",
    staff: ["Rosario Tello", "Yesenia Gamarra"],
    open: "09:30", close: "19:30", closedDays: [0], lunch: ["14:00", "15:00"],
    services: [
      ["Corte dama", "Corte con lavado y secado.", 45, 10, 45],
      ["Tinte de raíz", "Retoque de color en raíces.", 90, 10, 95],
      ["Alisado orgánico", "Alisado sin químicos fuertes.", 150, 15, 240],
      ["Manicure express", "Limado y esmaltado rápido.", 30, 5, 20],
      ["Lavado y secado", "Lavado con secado y modelado.", 40, 5, 35],
    ],
  },
  {
    name: "Centro de Masajes Equilibrio",
    slug: "masajes-equilibrio",
    desc: "Masajes terapéuticos y de relajación para aliviar el estrés del día a día.",
    address: "Av. Arequipa 1920, Lince",
    staff: ["Fabián Ortega", "Noelia Vega"],
    open: "09:00", close: "20:00", closedDays: [0], lunch: null,
    services: [
      ["Masaje sueco", "Masaje suave de relajación total.", 60, 10, 90],
      ["Masaje deportivo", "Recuperación muscular para deportistas.", 60, 10, 110],
      ["Reflexología", "Masaje de pies con puntos de presión.", 45, 10, 70],
      ["Masaje en pareja", "Sesión simultánea para dos personas.", 90, 15, 240],
    ],
  },
  {
    name: "Mirada Studio",
    slug: "mirada-studio",
    desc: "Especialistas en cejas y pestañas: realza tu mirada de forma natural.",
    address: "Av. Sucre 810, Magdalena del Mar",
    staff: ["Brenda Salcedo", "Ivana Rosales"],
    open: "10:00", close: "19:00", closedDays: [0, 1], lunch: ["14:00", "15:00"],
    services: [
      ["Lifting de pestañas", "Curvatura y tinte de pestañas naturales.", 60, 10, 90],
      ["Extensiones clásicas", "Extensiones pelo por pelo.", 120, 10, 150],
      ["Diseño de cejas", "Diseño según la forma de tu rostro.", 30, 5, 35],
      ["Laminado de cejas", "Cejas peinadas y definidas por semanas.", 50, 5, 80],
    ],
  },
  {
    name: "Fisioterapia Movimiento Vital",
    slug: "fisioterapia-movimiento-vital",
    desc: "Terapia física y rehabilitación para recuperar tu movimiento sin dolor.",
    address: "Av. La Marina 2350, San Miguel",
    staff: ["Lic. Joaquín Pinedo", "Lic. Carmen Valle"],
    open: "08:00", close: "18:00", satClose: "13:00", closedDays: [0], lunch: ["13:00", "14:00"],
    services: [
      ["Evaluación inicial", "Diagnóstico y plan de tratamiento.", 45, 10, 80],
      ["Sesión de terapia física", "Ejercicios y técnicas manuales.", 50, 10, 70],
      ["Rehabilitación deportiva", "Recuperación de lesiones deportivas.", 60, 10, 95],
      ["Masaje terapéutico", "Alivio de contracturas.", 40, 5, 65],
    ],
  },
  {
    name: "Barbería La Navaja",
    slug: "barberia-la-navaja",
    desc: "Afeitado tradicional con navaja y cortes clásicos, de lunes a domingo.",
    address: "Av. Túpac Amaru 3180, Independencia",
    staff: ["Wilmer Zavaleta", "Alexis Mendoza"],
    open: "09:00", close: "20:00", closedDays: [], lunch: ["14:00", "15:00"],
    services: [
      ["Corte clásico", "Corte a tijera o máquina.", 35, 5, 18],
      ["Afeitado tradicional", "Afeitado con navaja y toalla caliente.", 30, 5, 20],
      ["Corte + afeitado", "Servicio completo de caballero.", 60, 10, 35],
      ["Diseño de barba", "Perfilado y diseño de barba.", 25, 5, 15],
    ],
  },
  {
    name: "Pelitos Peluquería Canina",
    slug: "pelitos-peluqueria-canina",
    desc: "Baño y corte para perros y gatos, con cariño y paciencia.",
    address: "Av. Canta Callao 1450, San Martín de Porres",
    staff: ["Silvia Manrique", "Joel Arana"],
    open: "09:00", close: "18:00", satClose: "17:00", closedDays: [0], lunch: ["13:00", "14:00"],
    services: [
      ["Baño perro pequeño", "Baño y secado para razas pequeñas.", 60, 10, 40],
      ["Baño perro grande", "Baño y secado para razas grandes.", 90, 15, 70],
      ["Corte de pelo y baño", "Corte según raza con baño incluido.", 120, 15, 90],
      ["Corte de uñas", "Corte y limado de uñas.", 15, 5, 15],
      ["Baño de gato", "Baño suave para gatos.", 50, 10, 45],
    ],
  },
  {
    name: "Nutri+ Consultorio de Nutrición",
    slug: "nutri-mas",
    desc: "Planes de alimentación personalizados para bajar de peso, ganar músculo o comer mejor.",
    address: "Av. Angamos Este 1840, Surquillo",
    staff: ["Lic. Mónica Reátegui"],
    open: "09:00", close: "18:00", satClose: "12:00", closedDays: [0], lunch: ["13:00", "14:00"],
    services: [
      ["Primera consulta nutricional", "Evaluación completa y plan inicial.", 60, 10, 100],
      ["Control mensual", "Seguimiento y ajuste del plan.", 30, 5, 60],
      ["Plan deportivo", "Alimentación para tu entrenamiento.", 45, 10, 120],
      ["Evaluación corporal", "Medición de peso, grasa y músculo.", 30, 5, 50],
    ],
  },
  {
    name: "Inti Yoga",
    slug: "inti-yoga",
    desc: "Clases de yoga y meditación para todos los niveles en un espacio tranquilo.",
    address: "Av. Bolívar 920, Pueblo Libre",
    staff: ["Inés Villanueva", "Mauricio Paz"],
    open: "07:00", close: "21:00", satClose: "15:00", closedDays: [0], lunch: ["12:00", "13:00"],
    services: [
      ["Clase individual de yoga", "Sesión personalizada uno a uno.", 60, 10, 80],
      ["Yoga restaurativo", "Posturas suaves para soltar tensión.", 75, 10, 90],
      ["Meditación guiada", "Respiración y atención plena.", 45, 5, 50],
      ["Clase de prueba", "Primera clase para conocer el estudio.", 45, 5, 30],
    ],
  },
];

const CLIENT_NAMES = [
  "Lucía Paredes", "Diego Quispe", "Valeria Ramos", "Mateo Flores", "Camila Rojas",
  "Sebastián Vargas", "Daniela Castillo", "Jorge Huamán", "Fiorella Mendoza", "Andrés Salazar",
  "Patricia Chávez", "Luis Cárdenas", "Rosa Valdivia", "Miguel Torres", "Carolina Núñez",
  "Renato Delgado", "Milagros Ccori", "Bruno Aguilar", "Nicole Espinoza", "Gonzalo Ibarra",
];
const NOTES = ["Primera visita", "Prefiere atención puntual", "Reserva hecha desde la web"];

// ---------- Programa principal ----------
async function main() {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 8) {
    console.error('❌ Falta DEMO_PASSWORD (mínimo 8 caracteres). Agrégala a tu .env, por ejemplo: DEMO_PASSWORD="tu-clave-aqui"');
    process.exit(1);
  }

  try {
    console.log("🗄️  Base de datos:", new URL(process.env.DATABASE_URL ?? "").host);
  } catch {
    /* si no se puede leer, seguimos */
  }

  const force = process.env.FORCE_SEED === "1";
  const existingBusinesses = await prisma.business.count();
  const existingDemoUsers = await prisma.user.count({ where: { email: { endsWith: "@deto.test" } } });

  if ((existingBusinesses > 0 || existingDemoUsers > 0) && !force) {
    console.log(
      `⚠️  La base ya tiene datos (${existingBusinesses} negocios, ${existingDemoUsers} cuentas @deto.test). No se hizo ningún cambio.\n` +
      "   Para reemplazar SOLO los datos demo (cuentas @deto.test y sus negocios), corre con FORCE_SEED=1."
    );
    return;
  }

  if (force) {
    const demoUserIds = (
      await prisma.user.findMany({ where: { email: { endsWith: "@deto.test" } }, select: { id: true } })
    ).map((u) => u.id);
    const demoBizIds = (
      await prisma.business.findMany({ where: { ownerId: { in: demoUserIds } }, select: { id: true } })
    ).map((b) => b.id);
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { businessId: { in: demoBizIds } } }),
      prisma.booking.deleteMany({ where: { businessId: { in: demoBizIds } } }),
      prisma.business.deleteMany({ where: { id: { in: demoBizIds } } }),
      prisma.user.deleteMany({ where: { id: { in: demoUserIds } } }),
    ]);
    console.log(`🧹 Datos demo anteriores eliminados (${demoBizIds.length} negocios).`);
  }

  console.log("🌱 Generando datos demo...");
  const passwordHash = await bcrypt.hash(password, 10);

  const users: any[] = [];
  const businesses: any[] = [];
  const staffRows: any[] = [];
  const serviceCreates: any[] = [];
  const bizSchedules: any[] = [];
  const staffSchedules: any[] = [];
  const bookings: any[] = [];
  const payments: any[] = [];

  // Clientes
  const clients = CLIENT_NAMES.map((name, i) => {
    const c = {
      id: randomUUID(),
      email: `cliente${String(i + 1).padStart(2, "0")}@deto.test`,
      passwordHash,
      name,
      role: "CLIENT",
      phone: phone(),
    };
    users.push(c);
    return c;
  });

  let stripeCounter = 1;
  let totalServices = 0;
  const ownerEmails: string[] = [];

  for (const b of BUSINESSES) {
    const ownerName = b.staff[0];
    const owner = {
      id: randomUUID(),
      email: `${b.slug}@deto.test`,
      passwordHash,
      name: ownerName,
      role: "BUSINESS_OWNER",
      phone: phone(),
    };
    users.push(owner);
    ownerEmails.push(owner.email);

    const business = {
      id: randomUUID(),
      ownerId: owner.id,
      name: b.name,
      slug: b.slug,
      description: b.desc,
      phone: owner.phone,
      address: b.address,
      timezone: "America/Lima",
      currency: "PEN",
    };
    businesses.push(business);

    // Horarios del negocio (7 días)
    const hoursFor = (dow: number) => ({
      open: b.open,
      close: dow === 6 && b.satClose ? b.satClose : b.close,
      closed: b.closedDays.includes(dow),
    });
    for (let dow = 0; dow < 7; dow++) {
      const h = hoursFor(dow);
      bizSchedules.push({
        businessId: business.id,
        dayOfWeek: dow,
        openTime: h.open,
        closeTime: h.close,
        isClosed: h.closed,
      });
    }

    // Especialistas (el primero es el dueño)
    const staffList = b.staff.map((name, idx) => {
      const s = {
        id: randomUUID(),
        businessId: business.id,
        userId: idx === 0 ? owner.id : null,
        name,
        email: idx === 0 ? owner.email : null,
        phone: idx === 0 ? owner.phone : phone(),
        isDefault: idx === 0,
        isActive: true,
      };
      staffRows.push(s);
      return s;
    });

    // Horarios de cada especialista; los que no son el dueño descansan un día fijo
    const workMap = new Map<string, boolean>();
    staffList.forEach((s, idx) => {
      for (let dow = 0; dow < 7; dow++) {
        const h = hoursFor(dow);
        const dayOff = idx >= 1 && dow === idx; // 2.º descansa lunes, 3.º martes
        const working = !h.closed && !dayOff;
        workMap.set(`${s.id}:${dow}`, working);
        staffSchedules.push({
          staffMemberId: s.id,
          dayOfWeek: dow,
          startTime: h.open,
          endTime: h.close,
          breakStart: b.lunch ? b.lunch[0] : null,
          breakEnd: b.lunch ? b.lunch[1] : null,
          isWorking: working,
        });
      }
    });

    // Servicios (todos los especialistas los ofrecen)
    const serviceList = b.services.map(([name, description, minutes, buffer, soles]) => {
      const svc = {
        id: randomUUID(),
        businessId: business.id,
        name,
        description,
        durationMinutes: minutes,
        bufferMinutes: buffer,
        priceInCents: soles * 100,
        currency: "PEN",
      };
      serviceCreates.push({ ...svc, staffIds: staffList.map((s) => s.id) });
      totalServices++;
      return svc;
    });

    // Reservas: 3 o 4 por negocio, sin cruzarse por especialista
    const busy = new Map<string, Array<[number, number]>>();
    const bookingCount = int(3, 4);
    for (let n = 0; n < bookingCount; n++) {
      for (let attempt = 0; attempt < 60; attempt++) {
        const offset = chance(0.65) ? -int(1, 45) : int(0, 21);
        const day = addDays(today, offset);
        const dow = day.getUTCDay();
        const staff = pick(staffList);
        if (!workMap.get(`${staff.id}:${dow}`)) continue;

        const svc = pick(serviceList);
        const h = hoursFor(dow);
        const openMin = toMin(h.open);
        const closeMin = toMin(h.close);
        const room = closeMin - openMin - svc.durationMinutes;
        if (room < 0) continue;

        const startMin = openMin + 15 * int(0, Math.floor(room / 15));
        const endMin = startMin + svc.durationMinutes;
        if (b.lunch && startMin < toMin(b.lunch[1]) && endMin > toMin(b.lunch[0])) continue;

        const start = at(day, startMin);
        const end = at(day, endMin);
        const blockedUntil = end.getTime() + svc.bufferMinutes * 60000;
        const list = busy.get(staff.id) ?? [];
        if (list.some(([s, e]) => start.getTime() < e && blockedUntil > s)) continue;
        list.push([start.getTime(), blockedUntil]);
        busy.set(staff.id, list);

        const client = pick(clients);
        const isPast = end.getTime() < Date.now();
        let status: string;
        if (isPast) {
          const r = rand();
          status = r < 0.72 ? "COMPLETED" : r < 0.88 ? "CANCELLED" : "NO_SHOW";
        } else {
          status = chance(0.85) ? "CONFIRMED" : "CANCELLED";
        }

        const stripe = chance(0.4);
        let paymentStatus = "PENDING";
        let paymentRowStatus: string | null = null;
        if (stripe) {
          if (status === "CANCELLED") {
            paymentStatus = "REFUNDED";
            paymentRowStatus = "REFUNDED";
          } else {
            paymentStatus = "PAID";
            paymentRowStatus = "SUCCEEDED";
          }
        } else if (status === "COMPLETED") {
          paymentStatus = "PAID";
        }

        const bookingId = randomUUID();
        const sessionId = stripe ? `cs_test_demo_${String(stripeCounter).padStart(4, "0")}` : null;
        bookings.push({
          id: bookingId,
          businessId: business.id,
          serviceId: svc.id,
          staffMemberId: staff.id,
          customerId: client.id,
          customerName: client.name,
          customerEmail: client.email,
          customerPhone: client.phone,
          notes: chance(0.2) ? pick(NOTES) : null,
          startTime: start,
          endTime: end,
          status,
          paymentMethod: stripe ? "STRIPE" : "IN_PERSON",
          paymentStatus,
          stripeSessionId: sessionId,
          totalAmountInCents: svc.priceInCents,
        });

        if (stripe && paymentRowStatus) {
          payments.push({
            bookingId,
            businessId: business.id,
            stripePaymentIntentId: `pi_test_demo_${String(stripeCounter).padStart(4, "0")}`,
            stripeCheckoutSessionId: sessionId,
            amountInCents: svc.priceInCents,
            currency: "PEN",
            status: paymentRowStatus,
          });
        }
        if (stripe) stripeCounter++;
        break;
      }
    }
  }

  // Todo en una sola transacción: o se crea todo, o no se crea nada
  const ops: any[] = [
    prisma.user.createMany({ data: users }),
    prisma.business.createMany({ data: businesses }),
    prisma.staffMember.createMany({ data: staffRows }),
    ...serviceCreates.map(({ staffIds, ...svc }) =>
      prisma.service.create({
        data: { ...svc, staffMembers: { connect: staffIds.map((id: string) => ({ id })) } },
      })
    ),
    prisma.businessSchedule.createMany({ data: bizSchedules }),
    prisma.staffSchedule.createMany({ data: staffSchedules }),
    prisma.booking.createMany({ data: bookings }),
    prisma.payment.createMany({ data: payments }),
  ];
  await prisma.$transaction(ops);

  console.log("✅ Seed demo completado:");
  console.log(` - Negocios:   ${businesses.length}`);
  console.log(` - Servicios:  ${totalServices}`);
  console.log(` - Especialistas: ${staffRows.length}`);
  console.log(` - Clientes:   ${clients.length}`);
  console.log(` - Reservas:   ${bookings.length}`);
  console.log(` - Pagos:      ${payments.length}`);
  console.log(" - Contraseña de TODAS las cuentas: el valor de DEMO_PASSWORD");
  console.log(" - Dueños (correo = slug del negocio):");
  ownerEmails.forEach((e) => console.log(`     ${e}`));
  console.log(" - Clientes: cliente01@deto.test ... cliente20@deto.test");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed demo:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
