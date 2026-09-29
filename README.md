# Deto — Plataforma SaaS de Reservas y Gestión de Turnos

**Deto** es una plataforma SaaS moderna, minimalista y robusta para pequeños negocios y profesionales independientes que ofrecen servicios basados en turnos y citas (barberías, estéticas, estudios de diseño, spas, consultorios o freelancers).

---

## 🚀 Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS (arquitectura visual minimalista, limpia y modular)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js con adaptador Prisma y contraseñas cifradas con bcrypt
- **Pasarela de Pagos**: Stripe (Checkout Sessions & Webhooks, desacoplado del flujo de confirmación básico)
- **Testing**: Vitest (pruebas unitarias y de integración del motor de disponibilidad y transacciones)
- **Gestor de Paquetes**: pnpm

---

## 📌 Decisiones Clave de Arquitectura & Alcance

1. **Flujo de Pago Flexible y Desacoplado**:
   - En el MVP, el cliente puede agendar y **confirmar su reserva de inmediato con método de pago en el establecimiento** (`IN_PERSON`), sin forzar cobros con tarjeta.
   - La pasarela de Stripe está completamente cableada y preparada para pagos en línea opcionales mediante Checkout Sessions y Webhooks.

2. **Liberación Autónoma de Slots (`expiresAt`)**:
   - Las reservas pendientes de pago cuentan con un tiempo de retención (`expiresAt`, 15 minutos).
   - El **Motor de Disponibilidad** evalúa dinámicamente este campo: si una reserva está en `PENDING` pero `expiresAt < now()`, la considera **inexistente/libre**, liberando el slot al instante sin requerir que un servicio externo notifique la expiración.

3. **Arquitectura de Profesionales Escalable (V1 Unipersonal → V2 Multi-Staff)**:
   - En la V1, el negocio opera con un único propietario que actúa como especialista del negocio (`StaffMember` con `isDefault: true`).
   - El esquema relacional y el motor de disponibilidad asocian reservas y turnos a la entidad `StaffMember`. En la V2 bastará con habilitar la UI para agregar colaboradores e invitar usuarios, sin alterar el modelo de datos.

4. **Prevención Atómica de Doble Reserva**:
   - Creación de reservas mediante transacciones serializables en PostgreSQL (`prisma.$transaction`) que verifican colisiones y solapamientos antes de persistir, evitando condiciones de carrera.

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar / Navegar al directorio
```bash
cd /home/daniel/dev/deto
```

### 2. Instalar dependencias con pnpm
```bash
pnpm install
```

### 3. Levantar la base de datos PostgreSQL con Docker
```bash
docker compose up -d
```

### 4. Generar el cliente de Prisma y sincronizar la base de datos
```bash
pnpm db:push
```

### 5. Cargar datos de prueba (Seed)
```bash
pnpm db:seed
```
Esto creará el negocio demo **Barbería Deto** (`/b/barberia-deto`), servicios de ejemplo con buffers y el usuario propietario de prueba:
- **Email:** `demo@deto.test`
- **Contraseña:** `password123`

### 6. Ejecutar en modo desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas Automatizadas con Vitest

Para ejecutar la suite de pruebas unitarias y de servicios:

```bash
# Ejecutar todas las pruebas
pnpm test

# Ejecutar pruebas en modo observador (watch)
pnpm test:watch
```

Las pruebas cubren:
- Cálculo determinista de franjas horarias y días de cierre.
- Exclusión de solapamientos con descansos laborales (`breakStart` y `breakEnd`).
- Manejo de tiempos de buffer entre citas.
- **Liberación autónoma de reservas expiradas** (`expiresAt`).
- Creación atómica de reservas con bloqueo por conflicto (`SLOT_OCCUPIED`).
- Procesamiento y registro de eventos de webhook de Stripe.

---

## 📂 Estructura del Proyecto

```text
deto/
├── docker-compose.yml           # Base de datos PostgreSQL local
├── package.json                 # Scripts y dependencias (pnpm)
├── vitest.config.ts             # Configuración de pruebas
├── prisma/
│   ├── schema.prisma            # Modelos: User, Business, StaffMember, Service, Booking, Payment...
│   └── seed.ts                  # Datos de prueba iniciales
├── src/
│   ├── app/
│   │   ├── (auth)/              # /login y /register
│   │   ├── b/[slug]/            # Vista pública del negocio, servicios y reserva
│   │   ├── dashboard/           # Panel de control, agenda y catálogo de servicios
│   │   └── api/                 # Endpoints REST: availability, bookings, webhooks
│   ├── lib/
│   │   ├── auth.ts              # NextAuth con credenciales y sesiones
│   │   ├── db.ts                # Prisma singleton
│   │   ├── stripe.ts            # Cliente oficial de Stripe
│   │   └── utils.ts             # Formateo de fechas, monedas y slots
│   └── services/
│       ├── availability.service.ts # Motor puro de cálculo de disponibilidad
│       ├── booking.service.ts      # Transacciones de reserva y estados
│       └── payment.service.ts      # Checkout de Stripe y webhooks
└── tests/
    └── unit/
        ├── availability.test.ts    # Pruebas del motor de slots
        ├── booking-service.test.ts # Pruebas transaccionales de reserva
        └── stripe-webhook.test.ts  # Pruebas de webhook de pagos
```
