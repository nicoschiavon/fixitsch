import React from 'react';
import {
  Wrench,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Github,
  Instagram,
  Facebook,
  Mail,
  Phone,
  Sparkles,
  Zap,
  DollarSign,
  ChevronRight,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';
import { DEVELOPER_PROFILE, FEATURED_PROJECTS } from '../../data/portfolioData';
import { TrialAccount, WorkshopSettings } from '../../types';

interface LandingPageProps {
  onStartTrial: () => void;
  onOpenCheckout: () => void;
  onEnterApp: (tab?: 'orders' | 'inventory' | 'teardown' | 'history' | 'client_portal') => void;
  onOpenAuthModal: (mode?: 'signup' | 'login') => void;
  trial: TrialAccount;
  settings: WorkshopSettings;
  currentUser: import('../../types').UserAccount | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onOpenCheckout,
  onEnterApp,
  onOpenAuthModal,
  trial,
  settings,
  currentUser
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Cada taller con sus propios datos</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono">Entrá con tu usuario</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Gestioná tu taller de reparación como un{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">
            laboratorio profesional
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          <strong>FixiTsch</strong> es la plataforma integral para talleres de celulares, tablets y notebooks. Sin cuenta ves una demo que no se guarda. Con tu usuario, el taller empieza vacío y solo vos ves lo que cargás.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!currentUser ? (
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>Crear cuenta del taller</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onEnterApp('orders')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Ingresar a Mi Taller ({currentUser.name})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onEnterApp('orders')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>Probar Modo Demo (Sin cuenta)</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Acceso completo bonificado por el momento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sin tarjeta de crédito requerida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Persistencia completa al registrarte</span>
          </div>
        </div>

        {/* Hero Visual Preview Card */}
        <div className="pt-6">
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-hidden text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-xs font-semibold text-slate-500">
                  fixitsch.app/taller/ORD-1042
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                ● En vivo: Equipo Listo para Retiro
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">ORDEN ACTIVA</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Apple iPhone 14 OLED
                </div>
                <div className="text-slate-500">Cliente: Martín Palermo</div>
                <div className="text-emerald-600 font-semibold pt-1">
                  Saldo pendiente: $70.000 ARS
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">NOTIFICACIÓN AUTOMÁTICA</span>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp 1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  "¡Hola Martín! Tu iPhone 14 ya está LISTO para retirar..."
                </p>
                <div className="text-indigo-600 font-semibold pt-1">Link de portal incluido</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">HUESERA & DESPIECE</span>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Repuesto Recuperado</span>
                </div>
                <div className="text-slate-500">Módulo Cámara iPhone 12 (100% test)</div>
                <div className="text-amber-600 font-semibold pt-1">Ahorro en costo: +85%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Capacidades Diseñadas para Técnicos Reales
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Todo lo que tu taller necesita en una sola pantalla
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Olvidate de planillas de cálculo desordenadas y mensajes manuales de WhatsApp. FixiTsch automatiza el flujo técnico de principio a fin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Seguimiento de Órdenes & Checklist
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Registra celulares, tablets y notebooks con fotos, IMEI/serial, patrón de desbloqueo, accesorios y checklist técnico de 8 puntos para blindar la garantía.
            </p>
            <button
              onClick={() => onEnterApp('orders')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 cursor-pointer"
            >
              <span>Probar en la demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Notificaciones WhatsApp & Correo
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dispara avisos con un solo clic cuando el equipo pase a <strong>"Listo para Retirar"</strong> o cuando el presupuesto esté emitido, con saldo pendiente y link de seguimiento.
            </p>
            <button
              onClick={() => onEnterApp('orders')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 cursor-pointer"
            >
              <span>Probar en la demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Despiece & Huesera de Repuestos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El único software que te permite registrar aparatos dados de baja, evaluar componentes sanos y con 1 clic ingresarlos como repuestos recuperados al inventario.
            </p>
            <button
              onClick={() => onEnterApp('teardown')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline pt-2 cursor-pointer"
            >
              <span>Probar en la demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Inventario de Piezas & Gavetas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Control de pantallas, baterías, pines de carga, teclados y chips. Alertas de stock mínimo, costo versus precio de venta y ubicación exacta en tu taller.
            </p>
            <button
              onClick={() => onEnterApp('inventory')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-2 cursor-pointer"
            >
              <span>Probar en la demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5 */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Portal Público para Clientes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tus clientes ingresan su número de orden o escanean el QR para ver la línea de tiempo del arreglo y pueden <strong>Aprobar o Rechazar presupuestos online</strong>.
            </p>
            <button
              onClick={() => onEnterApp('client_portal')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2 cursor-pointer"
            >
              <span>Probar en la demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6 */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Trazabilidad por IMEI & Garantías
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Buscador histórico por número de serie o IMEI: sabrás exactamente cuándo ingresó el dispositivo en el pasado, qué repuesto se instaló y si la garantía aún sigue vigente.
            </p>
            <button
              onClick={() => onEnterApp('history')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline pt-2 cursor-pointer"
            >
              <span>Probar en la demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - Specifically requested: $30000 ARS mensuales */}
      <section id="planes" className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Planes y Precios Transparentes
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Un único plan profesional por $30.000 ARS mensuales
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Sin costos ocultos ni límites por cantidad de órdenes. Probá 15 días gratis y luego activá tu suscripción mensual fija.
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 border-2 border-indigo-600 dark:border-indigo-500 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Recomendado para Talleres
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Plan FixiTsch Taller Pro
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Gestión Completa & Multidispositivo
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Para laboratorios técnicos y talleres de celulares, notebooks y tablets.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                $30.000 <span className="text-sm font-sans font-bold text-slate-500">ARS / mes</span>
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">
                O $300.000 ARS anual (ahorro de 2 meses)
              </div>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
            {[
              'Órdenes de servicio ilimitadas',
              'Notificaciones automáticas por WhatsApp (1-clic con wa.me)',
              'Envío y simulación de correo electrónico institucional',
              'Módulo exclusivo de Despiece & Huesera para reciclar piezas',
              'Portal Web en tiempo real para que tus clientes consulten',
              'Aprobación digital de presupuestos en línea por el cliente',
              'Control de inventario, stock mínimo y gavetas físicas',
              'Checklist de control de calidad de 8 puntos',
              'Búsqueda histórica por IMEI / Serial y estado de garantía',
              'Impresión de tickets térmicos y comprobantes con QR',
              'Respaldo de base de datos en JSON descargable',
              'Soporte técnico prioritario por WhatsApp'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Empezar con 15 Días Gratis</span>
            </button>

            <button
              onClick={onOpenCheckout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Suscribirme al Plan ($30.000 ARS)</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION DEDICATED TO DEVELOPER NETWORKS AND OTHER PROJECTS */}
      <section id="developer" className="max-w-6xl mx-auto space-y-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Sobre el Creador & Proyectos de Software
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Redes de Contacto & Ecosistema de Desarrollos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Creado por <strong>{DEVELOPER_PROFILE.name}</strong>. Conocé mis canales de contacto directo y otros proyectos en producción.
          </p>
        </div>

        {/* Developer Bio & Social Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
              NS
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {DEVELOPER_PROFILE.name}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {DEVELOPER_PROFILE.role}
                  </p>
                </div>

                <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-center sm:self-auto">
                  {DEVELOPER_PROFILE.email}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                {DEVELOPER_PROFILE.bio}
              </p>

              {/* Social Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${DEVELOPER_PROFILE.whatsapp}?text=Hola%20Nico,%20vi%20tu%20proyecto%20FixiTsch%20y%20quiero%20hacerte%20una%20consulta`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {/* GitHub */}
                <a
                  href={DEVELOPER_PROFILE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {/* Instagram */}
                <a
                  href={DEVELOPER_PROFILE.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {/* Facebook */}
                <a
                  href={DEVELOPER_PROFILE.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {/* Email */}
                <a
                  href={`mailto:${DEVELOPER_PROFILE.email}?subject=Consulta%20sobre%20FixiTsch%20o%20Desarrollo%20de%20Software`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar Correo</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Other Projects Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span>Otros Proyectos & Desarrollos</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">5 aplicaciones activas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURED_PROJECTS.map((project) => (
              <div
                key={project.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                      {project.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                      {project.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {project.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="space-y-1 pt-1">
                    {project.features.slice(0, 2).map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={project.githubUrl || DEVELOPER_PROFILE.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Ver repositorio en GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
