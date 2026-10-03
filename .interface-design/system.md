# Deto SaaS — Sistema de Diseño

Documento de referencia para mantener consistencia visual y ergonómica en toda la plataforma.

## 1. Principios de Diseño
- **Estilo:** SaaS profesional, limpio, de alta densidad visual pero descansado (concentric borders, subtle shadows).
- **Regla 60-30-10:**
  - 60% Neutros de fondo y superficie (`zinc-50`, `white`, `zinc-900/950` para tipografía).
  - 30% Bordes tenues (`zinc-200/80`, `zinc-300`), textos secundarios (`zinc-500`, `zinc-400`).
  - 10% Acento púrpura/violeta intencional en elementos interactivos clave y estados activos.

## 2. Paleta de Colores (Highlight Morado)
- **Acento Primario:** `violet-600` (`#7c3aed`), hover `violet-700` (`#6d28d9`), active `violet-800`.
- **Fondo de Acento Tenue:** `violet-50` (`#f5f3ff`), hover `violet-100`.
- **Bordes de Acento:** `border-violet-200`, focus `focus:border-violet-500`.
- **Anillos de Foco:** `focus:ring-2 focus:ring-violet-500/20` o `focus:ring-violet-500/10`.
- **Sombras de Acento:** `shadow-violet-950/20`, `hover:shadow-violet-950/[0.04]`.
- **Texto en Acento:** `text-violet-600`, `text-violet-700`, `text-violet-900`.

## 3. Ergonomía de Botones e Iconos
- **Tamaño Mínimo de Botones:** `min-h-[38px]` para botones secundarios, `min-h-[44px]` para CTAs principales.
- **Iconos SVG Inline:** Reemplazo de caracteres Unicode crudos (`✓`, `✕`, `→`, `📍`) por SVGs delineados nítidos con `w-3.5 h-3.5` o `w-4 h-4`.
- **Micro-interacciones:** `active:scale-[0.98]` o `active:scale-95` en todos los botones para feedback táctil instantáneo.
- **Botones de Tablas/Acciones:** `px-3 py-1.5` con texto legible `text-xs font-semibold` e icono acompañante alineado con `gap-1.5`.

## 4. Tipografía y Datos Numéricos
- **Números tabulares:** Usar siempre `tabular-nums` en precios, horas, duraciones y métricas para evitar saltos de línea y desalineación.
- **Moneda:** Formateador unificado `formatCurrency(cents, currency)`.
- **Etiquetas de Estado:** Badges con `rounded-full px-2.5 py-0.5 text-xs font-medium`.

## 5. Componentes Clave
- **Header:** Botón único y unificado de autenticación ("Ingresar / Registrarse") con redirección a modal de bienvenida.
- **Booking Flow:** Pasos claros, tarjetas de horarios cómodas con feedback morado, opción de pago presencial activa y Stripe en Beta disabled.
- **Dashboard:** Métricas con iconos en contenedores `bg-violet-50 text-violet-600`, filtros y acciones con estados activos bien contrastados.
