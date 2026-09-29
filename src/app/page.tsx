import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. HERO SECTION & PRODUCT SIGNATURE */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-100">
        {/* Sutil gradiente radial de fondo para dar profundidad limpia */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.06),rgba(255,255,255,0))]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge de anuncio */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200/80 rounded-full text-xs font-semibold text-zinc-800 shadow-2xs mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-600">Deto SaaS V1</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-900 font-medium">Gestión de Citas para Negocios Modernos</span>
          </div>

          {/* Headline principal con ratio y tracking estricto */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 max-w-4xl mx-auto leading-[1.08]">
            Tu agenda llena de citas.{" "}
            <span className="text-zinc-400 block font-bold">Cero llamadas telefónicas.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Deto permite que tus clientes elijan servicio y horario en segundos.
            Tú eliminas dobles reservas, cobras en el local o en línea y mantienes tu negocio organizado en un solo panel.
          </p>

          {/* CTAs con jerarquía evidente */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/explorar"
              className="w-full sm:w-auto px-7 py-3.5 bg-zinc-950 text-white font-semibold rounded-lg hover:bg-zinc-800 text-sm shadow-md shadow-zinc-950/10 active:scale-[0.98] transition-all text-center"
            >
              Explorar Negocios & Catálogo →
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-white text-zinc-900 border border-zinc-200/90 font-semibold rounded-lg hover:bg-zinc-50 hover:border-zinc-300 text-sm shadow-2xs active:scale-[0.98] transition-all text-center"
            >
              Registrar mi Negocio Gratis
            </Link>
          </div>

          <div className="mt-4 text-xs text-zinc-500 font-medium">
            Sin tarjeta de crédito requerida • Configuración lista en 2 minutos • Diseñado para Perú (PEN / S/)
          </div>

          {/* PRODUCT SIGNATURE SPECIMEN: Miniatura viva de la experiencia de agenda */}
          <div className="mt-16 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-xl shadow-zinc-950/5 ring-1 ring-zinc-950/[0.03]">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 sm:p-6">
                {/* Cabecera del mockup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      D.
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-zinc-950">Barbería Deto — Panel en Vivo</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                          Abierto Hoy
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">Av. Larco 456, Miraflores • America/Lima</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white border border-zinc-200/90 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
                      <span className="text-zinc-500">Citas hoy: </span>
                      <strong className="text-zinc-950 tabular-nums">8 agendadas</strong>
                    </div>
                    <div className="bg-white border border-zinc-200/90 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
                      <span className="text-zinc-500">Ingresos: </span>
                      <strong className="text-emerald-700 tabular-nums font-bold">S/ 315.00</strong>
                    </div>
                  </div>
                </div>

                {/* Línea de tiempo visual demostrativa de cómo trabaja el motor */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Línea de tiempo de citas y disponibilidad inteligente
                  </div>

                  {/* Slot 1: Cita Confirmada */}
                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-zinc-900 tabular-nums bg-zinc-100 px-2 py-1 rounded">
                        10:00 - 10:35
                      </span>
                      <div>
                        <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                          <span>Ana Martínez</span>
                          <span className="text-[10px] text-zinc-400 font-normal">• Corte de Cabello Clásico</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">Especialista: Carlos Gómez</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-zinc-950 tabular-nums">S/ 35.00</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        CONFIRMADO
                      </span>
                    </div>
                  </div>

                  {/* Slot 2: Buffer de descanso visual */}
                  <div className="px-3.5 py-1.5 rounded-lg bg-zinc-100/70 border border-dashed border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 text-[10px]">10:35 - 10:45</span>
                      <span>☕ Intervalo de preparación y descanso (10 min buffer)</span>
                    </div>
                    <span className="text-zinc-400 text-[10px]">Automático</span>
                  </div>

                  {/* Slot 3: Turno libre para el cliente */}
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-emerald-900 tabular-nums bg-emerald-100/70 px-2 py-1 rounded">
                        10:45 - 11:10
                      </span>
                      <div>
                        <div className="text-xs font-bold text-emerald-950">Horario libre disponible</div>
                        <div className="text-[11px] text-emerald-700">Listo para ser agendado por un cliente desde la web</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">Perfilado de Barba</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                        DISPONIBLE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EL DOLOR VS LA SOLUCIÓN (POR QUÉ LOS NEGOCIOS ELIGEN DETO) */}
      <section className="py-20 md:py-24 bg-zinc-50/60 border-b border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
              Transformación para tu Comercio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight mt-2">
              Dile adiós al caos de responder mensajes todo el día
            </h2>
            <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
              Tus clientes no quieren esperar a que leas un chat para saber a qué hora atiendes.
              Dales una experiencia rápida que trabaje por ti las 24 horas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Antes: El dolor habitual */}
            <div className="bg-white p-8 rounded-2xl border border-red-200/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 w-full bg-red-400" />
              <div className="flex items-center gap-2 mb-4 text-red-700 text-xs font-bold uppercase tracking-wider">
                <span>✕</span> Como atienden los negocios tradicionales
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-3">La libreta y el WhatsApp desbordado</h3>
              <ul className="space-y-3.5 text-xs text-zinc-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Clientes preguntando "¿Tienes libre a las 4?" mientras estás ocupado atendiendo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Citas empalmadas o dobles reservas por anotar en libretas de papel o agendas compartidas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Clientes que olvidan su turno porque no recibieron un respaldo ni confirmación por correo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Sin registro claro de cuánto dinero ingresó ni cuáles son los servicios más solicitados.</span>
                </li>
              </ul>
            </div>

            {/* Ahora: Con Deto */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-300 shadow-sm relative overflow-hidden ring-1 ring-emerald-500/10">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-emerald-600" />
              <div className="flex items-center gap-2 mb-4 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <span>✓</span> Con Deto en tu negocio
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-3">Tu negocio con tecnología de primer nivel</h3>
              <ul className="space-y-3.5 text-xs text-zinc-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span><strong>Enlace público propio:</strong> Compártelo en Instagram, WhatsApp o TikTok y recibe reservas 24/7.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span><strong>Motor de disponibilidad atómico:</strong> Cálculo instantáneo que hace imposible los cruces de turnos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span><strong>Notificaciones por correo:</strong> El cliente recibe un comprobante formal al instante (Resend).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span><strong>Panel de control diario:</strong> Citas de hoy, estado de cobro, historial de clientes y métricas reales.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAPACIDADES DEL SISTEMA (BENTO GRID CON RITMO ESPACIAL) */}
      <section id="negocios" className="py-20 md:py-28 bg-white border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">
              Todo Incluido en la V1
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight mt-2">
              Herramientas pensadas para que trabajes tranquilo
            </h2>
            <p className="text-zinc-600 mt-2 text-sm">
              Cada función fue decidida para simplificar tu jornada y la de tus clientes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bento Card 1: Servicios y Precios */}
            <div className="p-7 rounded-2xl border border-zinc-200/90 bg-zinc-50/40 hover:bg-white hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-xs">
                  S/
                </div>
                <h3 className="font-bold text-zinc-950 text-lg mb-2">Catálogo de Servicios Flexible</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Crea, edita, pausa o elimina servicios en Soles peruanos (PEN). Define la duración exacta y el tiempo de buffer o descanso entre clientes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200/60 text-xs font-semibold text-zinc-900">
                Duración + Buffer personalizable →
              </div>
            </div>

            {/* Bento Card 2: Horarios */}
            <div className="p-7 rounded-2xl border border-zinc-200/90 bg-zinc-50/40 hover:bg-white hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-xs">
                  ⏰
                </div>
                <h3 className="font-bold text-zinc-950 text-lg mb-2">Horarios Semanales & Descansos</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Configura tus horas de apertura por día (Lunes a Sábado, Domingo cerrado) y tus descansos de almuerzo. El motor no ofrecerá turnos fuera de horario.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200/60 text-xs font-semibold text-zinc-900">
                Control horario día por día →
              </div>
            </div>

            {/* Bento Card 3: Pagos */}
            <div className="p-7 rounded-2xl border border-zinc-200/90 bg-zinc-50/40 hover:bg-white hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-xs">
                  💳
                </div>
                <h3 className="font-bold text-zinc-950 text-lg mb-2">Pagos en el Local o Stripe</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  No obligues a tus clientes a pagar por adelantado si no quieren: confirma citas al instante para pago en caja o activa cobros con tarjeta.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200/60 text-xs font-semibold text-zinc-900">
                Stripe integrado + modo demo →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PASO A PASO: CÓMO EMPEZAR */}
      <section id="como-funciona" className="py-20 md:py-24 bg-zinc-50/60 border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
              Fácil y Veloz
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              En marcha en 3 pasos
            </h2>
            <p className="text-xs text-zinc-600 mt-2">
              No necesitas instalar aplicaciones pesadas ni aprender manuales extensos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-7 rounded-2xl border border-zinc-200/90 shadow-2xs">
              <div className="text-2xl font-black text-zinc-300 mb-3">01</div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">Registra tu Negocio</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Ingresa tu nombre comercial, dirección en Lima o cualquier ciudad de Perú, teléfono y correo en menos de un minuto.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-zinc-200/90 shadow-2xs">
              <div className="text-2xl font-black text-zinc-300 mb-3">02</div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">Carga tus Servicios</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Indica tus cortes, tratamientos o consultas con su tarifa en Soles y la duración aproximada.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-zinc-200/90 shadow-2xs">
              <div className="text-2xl font-black text-zinc-300 mb-3">03</div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">Comparte tu Enlace</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Tus clientes entran a tu enlace, eligen su turno y tú recibes las citas ordenadas y confirmadas en tu agenda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRECIOS TRANSPARENTES */}
      <section id="precios" className="py-20 md:py-24 bg-white border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">
              Planes & Tarifas
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              Planes honestos para negocios reales
            </h2>
            <p className="text-xs text-zinc-600 mt-2">
              Comienza hoy sin pagar nada y escala a tu propio ritmo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Gratuito */}
            <div className="p-8 rounded-2xl border-2 border-zinc-900 bg-white flex flex-col justify-between shadow-lg shadow-zinc-950/5 relative">
              <div className="absolute -top-3 left-6 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Recomendado para comenzar
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-950">Plan Inicial</h3>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Activo
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-zinc-950 tracking-tight tabular-nums">S/ 0</span>
                  <span className="text-xs text-zinc-500">/ para siempre</span>
                </div>
                <p className="text-xs text-zinc-600 mt-3 mb-6">
                  Perfecto para barberos, estilistas, terapeutas y dueños con un local o especialidad.
                </p>

                <ul className="space-y-3 text-xs text-zinc-700 border-t border-zinc-100 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>1 Negocio con especialista por defecto</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Catálogo de servicios y precios ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Agenda y calendario interactivo en vivo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Envío de confirmaciones por email (Resend)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Presencia en el Catálogo Deto (/explorar)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100">
                <Link
                  href="/register"
                  className="block w-full text-center py-3 bg-zinc-950 text-white font-semibold rounded-lg hover:bg-zinc-800 text-xs shadow-sm active:scale-[0.98] transition-all"
                >
                  Registrar mi Negocio Ahora →
                </Link>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="p-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-950">Plan Multinegocio Pro</h3>
                  <span className="text-xs text-zinc-500 font-semibold bg-zinc-200/80 px-2 py-0.5 rounded">
                    V2
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-950 tracking-tight tabular-nums">S/ 49</span>
                  <span className="text-xs text-zinc-500">/ mes</span>
                </div>
                <p className="text-xs text-zinc-600 mt-3 mb-6">
                  Para franquicias, negocios con múltiples profesionales y recordatorios avanzados.
                </p>

                <ul className="space-y-3 text-xs text-zinc-600 border-t border-zinc-200/60 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="text-zinc-400">✓</span>
                    <span>Múltiples especialistas con agendas individuales</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-zinc-400">✓</span>
                    <span>Recordatorios por WhatsApp automáticos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-zinc-400">✓</span>
                    <span>Cobros automatizados con tarjeta de crédito</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-zinc-400">✓</span>
                    <span>Métricas avanzadas de retención de clientes</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-200/60">
                <button
                  disabled
                  className="block w-full text-center py-3 bg-zinc-200 text-zinc-400 font-semibold rounded-lg text-xs cursor-not-allowed"
                >
                  Próximamente en V2
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BANNER FINAL DE CONVERSIÓN */}
      <section className="py-20 md:py-24 bg-zinc-950 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Haz que agendar en tu negocio sea un placer.
          </h2>
          <p className="text-zinc-400 mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Súmate a la plataforma de reservas que moderniza los pequeños comercios en Perú.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-zinc-950 font-bold rounded-lg hover:bg-zinc-100 text-sm shadow-md active:scale-[0.98] transition-all"
            >
              Crear mi Negocio Gratis
            </Link>
            <Link
              href="/explorar"
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold rounded-lg hover:bg-zinc-800 hover:text-white text-sm active:scale-[0.98] transition-all"
            >
              Explorar Catálogo Público →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
