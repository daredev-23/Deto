import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* 1. HERO SECTION & PRODUCT SIGNATURE */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Luminous dynamic ambient gradient mesh */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-violet-400/20 via-purple-300/25 to-indigo-400/20 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge de anuncio estilo liquid glass */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 liquid-glass-tint rounded-full text-xs font-semibold text-violet-950 mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse shadow-xs shadow-violet-500/50" />
            <span className="font-bold text-violet-900">Deto SaaS</span>
            <span className="text-violet-300">|</span>
            <span className="text-violet-950 font-medium">Gestión de Citas para Negocios Modernos</span>
          </div>

          {/* Headline principal */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 max-w-4xl mx-auto leading-[1.08]">
            Tu agenda llena de citas.{" "}
            <span className="block font-bold bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-500 bg-clip-text text-transparent">
              Cero llamadas telefónicas.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Deto permite que tus clientes elijan servicio y horario en segundos.
            Tú eliminas dobles reservas, cobras en el local y mantienes tu negocio organizado en un solo panel.
          </p>

          {/* CTAs con botones ergonómicos y gradientes líquidos */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explorar"
              className="btn-liquid-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-600/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explorar Negocios & Catálogo</span>
              <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/register"
              className="liquid-glass hover:bg-white/90 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-zinc-800 font-semibold rounded-xl text-sm border border-white/80 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Registrar mi Negocio Gratis</span>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          <div className="mt-5 text-xs text-zinc-500 font-medium">
            Sin tarjeta de crédito requerida • Configuración lista en 2 minutos • Diseñado para Perú (PEN / S/)
          </div>

          {/* PRODUCT SIGNATURE SPECIMEN: Miniatura viva estilo liquid glass */}
          <div className="mt-16 max-w-4xl mx-auto text-left">
            <div className="liquid-glass rounded-3xl p-3 shadow-2xl shadow-violet-900/10 border border-white/80">
              <div className="liquid-glass-subtle rounded-2xl p-4 sm:p-6 border border-white/60">
                {/* Cabecera del mockup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-violet-500/30">
                      D.
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-zinc-950">Barbería Deto — Panel en Vivo</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-900 border border-violet-200/80">
                          Abierto Hoy
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">Av. Larco 456, Miraflores • America/Lima</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="liquid-glass border border-white/80 px-3 py-1.5 rounded-xl text-xs shadow-xs">
                      <span className="text-zinc-500">Citas hoy: </span>
                      <strong className="text-zinc-950 tabular-nums">8 agendadas</strong>
                    </div>
                    <div className="liquid-glass border border-white/80 px-3 py-1.5 rounded-xl text-xs shadow-xs">
                      <span className="text-zinc-500">Ingresos: </span>
                      <strong className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent tabular-nums font-bold">S/ 315.00</strong>
                    </div>
                  </div>
                </div>

                {/* Línea de tiempo visual demostrativa de cómo trabaja el motor */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Línea de tiempo de citas y disponibilidad inteligente
                  </div>

                  {/* Slot 1: Cita Confirmada */}
                  <div className="liquid-glass p-3.5 rounded-2xl border border-white/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-zinc-800 tabular-nums bg-white/80 border border-zinc-200/60 px-2.5 py-1 rounded-lg">
                        10:00 - 10:35
                      </span>
                      <div>
                        <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                          <span>Ana Martínez</span>
                          <span className="text-xs text-zinc-400 font-normal">• Corte de Cabello Clásico</span>
                        </div>
                        <div className="text-xs text-zinc-500">Especialista: Carlos Gómez</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-zinc-950 tabular-nums">S/ 35.00</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100/80 text-violet-900 border border-violet-200/70">
                        CONFIRMADO
                      </span>
                    </div>
                  </div>

                  {/* Slot 2: Buffer de descanso visual */}
                  <div className="px-3.5 py-2 rounded-xl liquid-glass-subtle border border-dashed border-zinc-300/80 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 text-xs">10:35 - 10:45</span>
                      <span>☕ Intervalo de preparación y descanso (10 min buffer)</span>
                    </div>
                    <span className="text-zinc-400 text-xs font-medium">Automático</span>
                  </div>

                  {/* Slot 3: Turno libre para el cliente */}
                  <div className="liquid-glass-tint p-3.5 rounded-2xl border border-violet-300/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-violet-950 tabular-nums bg-white/90 border border-violet-200 px-2.5 py-1 rounded-lg">
                        10:45 - 11:10
                      </span>
                      <div>
                        <div className="text-xs font-bold text-violet-950">Horario libre disponible</div>
                        <div className="text-xs text-violet-700">Listo para ser agendado por un cliente desde la web</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-900">Perfilado de Barba</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs">
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

      {/* 2. CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 md:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Proceso Simplificado
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight mt-1.5">
              Cómo funciona para tus clientes
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Sin descargas obligatorias de apps pesadas ni registros interminables.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="liquid-glass p-8 rounded-3xl border border-white/80 shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-base mb-5 shadow-md shadow-violet-500/30">
                1
              </div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">Ingresan a tu enlace</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Coloca tu link en Instagram, WhatsApp o Google Maps. Tu cliente ve tus servicios y tarifas en Soles.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-3xl border border-white/80 shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-base mb-5 shadow-md shadow-violet-500/30">
                2
              </div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">Seleccionan su horario</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                El motor calcula en tiempo real los slots libres, respetando la duración del servicio y descansos.
              </p>
            </div>

            <div className="liquid-glass p-8 rounded-3xl border border-white/80 shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-base mb-5 shadow-md shadow-violet-500/30">
                3
              </div>
              <h3 className="text-base font-bold text-zinc-950 mb-2">Cita confirmada al instante</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Ambos reciben notificación de confirmación y el turno queda bloqueado en la agenda automáticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRECIOS TRANSPARENTES */}
      <section id="precios" className="py-20 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Planes & Tarifas
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              Planes honestos para negocios reales
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Comienza hoy sin pagar nada y escala a tu propio ritmo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Gratuito con liquid glass tint destacado */}
            <div className="p-8 rounded-3xl liquid-glass-tint border-2 border-violet-400/50 flex flex-col justify-between shadow-xl shadow-violet-900/10 relative">
              <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md shadow-violet-500/30">
                Recomendado para comenzar
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-950">Plan Inicial</h3>
                  <span className="text-xs text-violet-900 font-bold bg-white/80 px-3 py-0.5 rounded-full border border-violet-200 shadow-2xs">
                    Activo
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-zinc-950 tracking-tight tabular-nums">S/ 0</span>
                  <span className="text-xs text-zinc-500 font-medium">/ para siempre</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 mt-3 mb-6">
                  Perfecto para barberos, estilistas, terapeutas y dueños con un local o especialidad.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-zinc-700 border-t border-violet-200/50 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>1 Negocio con especialista por defecto</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Catálogo de servicios y precios ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Agenda y calendario interactivo en vivo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Envío de confirmaciones automáticas por email</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Presencia en el Catálogo Deto (/explorar)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-violet-200/50">
                <Link
                  href="/register"
                  className="btn-liquid-gradient inline-flex items-center justify-center gap-2 w-full py-3.5 text-white font-semibold rounded-xl text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Registrar mi Negocio Ahora</span>
                  <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="p-8 rounded-3xl liquid-glass-subtle border border-white/80 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-950">Plan Multinegocio Pro</h3>
                  <span className="text-xs text-zinc-500 font-semibold bg-white/80 px-2.5 py-0.5 rounded-full border border-zinc-200">
                    V2
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-950 tracking-tight tabular-nums">S/ 49</span>
                  <span className="text-xs text-zinc-500">/ mes</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 mt-3 mb-6">
                  Para franquicias, negocios con múltiples profesionales y recordatorios avanzados.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 border-t border-white/60 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="text-zinc-400">✓</span>
                    <span>Múltiples especialistas con agendas individuales</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-zinc-400">✓</span>
                    <span>Recordatorios automáticos avanzados</span>
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

              <div className="mt-8 pt-6 border-t border-white/60">
                <button
                  disabled
                  className="block w-full text-center py-3.5 bg-zinc-200/70 text-zinc-400 font-semibold rounded-xl text-xs cursor-not-allowed"
                >
                  Próximamente en V2
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BANNER FINAL DE CONVERSIÓN CON ATMÓSFERA LIQUID GLASS DARK */}
      <section className="py-24 liquid-glass-dark text-white text-center relative overflow-hidden rounded-3xl mx-4 sm:mx-6 my-10 border border-white/10">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-fuchsia-600/20 blur-3xl rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Haz que agendar en tu negocio sea un placer.
          </h2>
          <p className="text-zinc-300 mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Súmate a la plataforma de reservas que moderniza los pequeños comercios en Perú.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-liquid-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm shadow-xl shadow-violet-600/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Crear mi Negocio Gratis</span>
              <svg className="w-4 h-4 text-violet-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/explorar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl text-sm active:scale-[0.98] transition-all cursor-pointer backdrop-blur-md"
            >
              <span>Explorar Catálogo Público</span>
              <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
