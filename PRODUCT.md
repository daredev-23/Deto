# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Negocios y Profesionales:** Proveedores de servicios que necesitan un portal profesional para publicar su catálogo de servicios, gestionar horarios, tarifas y supervisar su calendario de reservas sin complicaciones de software corporativo pesado.
- **Clientes finales:** Personas que buscan agendar citas rápidas, visualizar disponibilidad en tiempo real sin llamadas ni esperas manuales, y gestionar sus reservas pendientes o historial de visitas.

## Product Purpose
Deto es una plataforma SaaS profesional que conecta negocios y profesionales prestadores de servicios con sus clientes mediante un sistema de reservas en tiempo real, catálogo público interactivo y panel de control operativo. Su éxito se mide en la reducción de fricción para agendar citas, cero turnos duplicados y facilidad de autogestión para los negocios.

## Positioning
SaaS de agendamiento profesional, ligero y directo, con experiencia visual moderna (estilo SaaS refinado en morado, microinteracciones ágiles) y arquitectura de mínima complejidad. A diferencia de soluciones infladas o con configuraciones abrumadoras, Deto prioriza la velocidad de reserva presencial y la gestión sin barreras técnicas.

## Operating Context
- **Negocio:** Se utiliza principalmente en navegadores de escritorio, laptops o tablets en el punto de atención o administración del negocio para revisar citas del día, marcar citas atendidas o pausar servicios.
- **Cliente:** Se utiliza primordialmente en dispositivos móviles (smartphones) al acceder al enlace del negocio (vía redes sociales, QR o exploración web) y agendar en menos de 2 minutos.

## Capabilities and Constraints
- **Capacidades confirmadas:**
  - Catálogo público por slug de negocio (`/b/[slug]`) y vista detallada de servicio.
  - Generación dinámica de slots de tiempo considerando duración y buffer entre citas.
  - Flujo de reserva con confirmación inmediata y opción de añadir a Google Calendar.
  - Gestión de citas del cliente (`/mis-citas`) con opción de cancelación dentro de políticas.
  - Dashboard de negocio con métricas de citas e ingresos estimados, vista de calendario y gestor CRUD de servicios.
  - Registro unificado en dos perfiles ("Reservar Servicios" para clientes y "Ofrece tus Servicios" para negocios).
  - Pago en el establecimiento como método predeterminado y activo.
- **Restricciones y decisiones abiertas:**
  - Pasarela Stripe preservada en UI como opción deshabilitada (etiquetada como BETA) para activación en fases posteriores.
  - Despliegue web responsive; sin empaquetado nativo (web estándar).
  - Modelo de monetización por suscripción SaaS escalonada por negocio (Básico / Pro / Negocio) con agendamiento presencial gratuito para clientes.

## Brand Commitments
- Nombre de producto: **Deto**.
- Acento de marca y resalte: Morado / violeta (`violet-600`), asociado a SaaS moderno, profesional y distintivo.
- Tono: Profesional, claro, confiable y directo, sin jerga técnica para el cliente final.

## Evidence on Hand
- Base de código completa en Next.js 14 App Router con base de datos PostgreSQL mediante Prisma ORM.
- 18 rutas implementadas y verificadas bajo compilación estricta (`next build`).
- Suite de pruebas unitarias automatizadas (`tests/unit/`) con 100% de éxito.
- Guía de diseño establecida en `.interface-design/system.md`.

## Product Principles
1. **Fricción Cero en la Reserva:** Un cliente debe poder seleccionar servicio, fecha y hora y confirmar su turno en menos de 3 clics desde la página del negocio.
2. **Claridad Operativa para el Negocio:** El dueño de negocio debe entender el estado de su día (citas pendientes, atendidas, ingresos) de un solo vistazo.
3. **Ergonomía y Precisión Numérica:** Botones con áreas táctiles accesibles (mínimo 38-44px), iconografía SVG nítida y cifras en fuentes monoespaciadas/tabulares (`tabular-nums`).
4. **Mínima Complejidad Técnica:** Código limpio, sin dependencias prescindibles ni abstracciones infladas.

## Accessibility & Inclusion
- Contraste visual accesible en fondos claros con textos oscuros (`zinc-950`) y acento `violet-600` / `violet-700`.
- Elementos interactivos con feedback táctil y estados de foco visibles (`focus:ring-2 focus:ring-violet-500/20`).
- Soporte total para navegación táctil y de escritorio.
