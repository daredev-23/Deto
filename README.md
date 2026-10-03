# Deto

**Reservas en línea para negocios de servicios.** Barberías, salones, spas, consultorios: cada negocio tiene su propia página donde los clientes eligen un servicio y agendan su cita, sin llamadas ni mensajes de ida y vuelta.

🔗 **Demo en vivo:** https://deto-theta.vercel.app

## La idea

Muchos negocios pequeños todavía agendan citas por WhatsApp o en un cuaderno. Eso genera cruces de horario, citas olvidadas y tiempo perdido contestando mensajes.

Deto le da a cada negocio una página pública para reservar y un lugar donde organizar sus servicios, horarios y especialistas.

## Qué se puede hacer

**Como cliente**
- Entrar a la página de un negocio y ver sus servicios con duración y precio en soles.
- Reservar una cita y elegir si paga en persona o en línea.
- Tener una cuenta para ver sus reservas.

**Como dueño de un negocio**
- Definir sus servicios, precios y tiempos de atención.
- Configurar los horarios del local y de cada especialista, incluyendo descansos.
- Ver y gestionar las reservas (confirmadas, completadas, canceladas).

## Pruébalo

La demo trae **15 negocios de ejemplo de Lima** con servicios, horarios y reservas ya cargadas.

| Rol | Correo | Contraseña |
|---|---|---|
| Dueño de una barbería | `el-corte-fino@deto.test` | `TU-CLAVE-DEMO` |
| Cliente | `cliente01@deto.test` | `TU-CLAVE-DEMO` |

Los pagos están en modo prueba: no se cobra dinero real.

## Con qué está hecho

| Parte | Herramienta | Para qué |
|---|---|---|
| La web | Next.js + TypeScript | Las páginas y la lógica de la aplicación |
| Datos | PostgreSQL en Supabase + Prisma | Guardar negocios, servicios, horarios y reservas |
| Cuentas | NextAuth | Inicio de sesión con correo y contraseña |
| Diseño | Tailwind CSS | Estilos |
| Pagos | Stripe (modo prueba) | Pago en línea de reservas |
| Publicación | Vercel | Poner la app en internet |

## Lo que trabajé en este proyecto

- Conecté la aplicación a una base de datos en la nube y la dejé funcionando en producción.
- Preparé datos de demostración realistas: 15 negocios, 20 clientes y decenas de reservas sin cruces de horario.
- Publiqué la app en Vercel con sus variables de configuración y secretos fuera del código.

## Estado

Proyecto en desarrollo. Los pagos están en modo prueba y los correos de confirmación se activan al configurar el servicio de envío.

<details>
<summary><b>Ejecutarlo en tu computadora</b></summary>

Necesitas Node.js, pnpm y una base PostgreSQL.

```bash
git clone https://github.com/daredev-23/Deto.git
cd Deto
pnpm install
# crea un archivo .env con tus datos (DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
pnpm prisma db push
pnpm dev
```

Luego abre http://localhost:3000. Para cargar los negocios de ejemplo, agrega `DEMO_PASSWORD` a tu `.env` y corre `pnpm tsx prisma/seed-demo.ts`.

</details>

## Autor

**Daniel Carbajal Tacuri** · [GitHub](https://github.com/daredev-23)
