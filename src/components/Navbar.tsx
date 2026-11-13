import React from 'react';
import {
  Wrench,
  Moon,
  Sun,
  Plus,
  Settings,
  ExternalLink,
  LogOut,
  LogIn,
} from 'lucide-react';
import { AppTab, ShellMode, WorkshopTab } from '../utils/appShell';
import { isLogoDataUrl } from '../utils/logo';

interface NavbarProps {
  mode: ShellMode;
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenNewOrder: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal: (mode?: 'signup' | 'login') => void;
  onEnterDemo: () => void;
  onExitDemo: () => void;
  onGoHome: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeOrdersCount: number;
  lowStockCount: number;
  workshopName: string;
  logoDataUrl?: string;
  isPlatformOwner: boolean;
}

const WORKSHOP_LINKS: Array<{ id: WorkshopTab; label: string }> = [
  { id: 'orders', label: 'Órdenes' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'teardown', label: 'Despiece' },
  { id: 'history', label: 'Historial' },
  { id: 'client_portal', label: 'Portal Clientes' },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || 'T') + (parts[1]?.[0] || '')).toUpperCase();
}

function BrandMark({ logoDataUrl, fallback }: { logoDataUrl?: string; fallback: 'wrench' | string }) {
  if (logoDataUrl && isLogoDataUrl(logoDataUrl)) {
    return (
      <img
        src={logoDataUrl}
        alt=""
        className="w-9 h-9 rounded-lg object-cover bg-white shadow-sm"
      />
    );
  }
  if (fallback === 'wrench') {
    return (
      <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
        <Wrench className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-sm shadow-indigo-500/20">
      {fallback}
    </div>
  );
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  if (props.mode === 'public' || props.mode === 'portal') {
    return <PublicBar {...props} />;
  }
  return <WorkshopBar {...props} />;
};

function PublicBar({ mode, onOpenAuthModal, onEnterDemo, onGoHome }: NavbarProps) {
  const home = (
    <button
      type="button"
      onClick={onGoHome}
      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap"
    >
      Inicio
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 min-h-16 py-2">
          <button type="button" onClick={onGoHome} className="flex items-center gap-2.5 text-left shrink-0">
            <BrandMark fallback="wrench" />
            <div className="leading-tight">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                FixiT<span className="text-indigo-600 dark:text-indigo-400">sch</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider">
                {mode === 'portal' ? 'SEGUIMIENTO DE ORDEN' : 'GESTIÓN DE SERVICIO TÉCNICO'}
              </span>
            </div>
          </button>

          {mode === 'portal' ? (
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
            >
              Volver al inicio
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {home}
              <PublicActions onOpenAuthModal={onOpenAuthModal} onEnterDemo={onEnterDemo} />
            </div>
          )}
        </div>

        {mode === 'public' && (
          <div className="md:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            {home}
            <PublicActions onOpenAuthModal={onOpenAuthModal} onEnterDemo={onEnterDemo} />
          </div>
        )}
      </div>
    </header>
  );
}

function PublicActions({
  onOpenAuthModal,
  onEnterDemo,
}: {
  onOpenAuthModal: (mode?: 'signup' | 'login') => void;
  onEnterDemo: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpenAuthModal('login')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Ingresar</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenAuthModal('signup')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg whitespace-nowrap shrink-0"
      >
        Crear cuenta
      </button>
      <button
        type="button"
        onClick={onEnterDemo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs whitespace-nowrap shrink-0"
      >
        Probar modo demo
      </button>
    </>
  );
}

function WorkshopBar({
  mode,
  currentTab,
  onSelectTab,
  onOpenNewOrder,
  onOpenSettings,
  onExitDemo,
  onLogout,
  isDark,
  onToggleTheme,
  activeOrdersCount,
  lowStockCount,
  workshopName,
  logoDataUrl,
  isPlatformOwner,
}: NavbarProps) {
  const isAccount = mode === 'account';
  const name = isAccount ? workshopName || 'Tu taller' : 'FixiTsch';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 min-h-16 py-2">
          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className="flex items-center gap-2.5 text-left min-w-0 shrink"
          >
            <BrandMark
              logoDataUrl={isAccount ? logoDataUrl : undefined}
              fallback={isAccount ? initials(name) : 'wrench'}
            />
            <div className="leading-tight min-w-0">
              <span className="block text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[9rem] sm:max-w-[14rem]">
                {isAccount ? (
                  name
                ) : (
                  <>
                    FixiT<span className="text-indigo-600 dark:text-indigo-400">sch</span>
                  </>
                )}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium truncate">
                {isAccount
                  ? isPlatformOwner
                    ? 'Cuenta principal'
                    : 'Tu taller'
                  : 'Modo demo'}
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {WORKSHOP_LINKS.map((link) => (
              <WorkshopLink
                key={link.id}
                link={link}
                currentTab={currentTab}
                onSelectTab={onSelectTab}
                activeOrdersCount={activeOrdersCount}
                lowStockCount={lowStockCount}
              />
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <IconButton
              label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              onClick={onToggleTheme}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </IconButton>
            <IconButton label="Configuración del taller" onClick={onOpenSettings}>
              <Settings className="w-4 h-4" />
            </IconButton>
            <button
              type="button"
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Orden</span>
            </button>
            {isAccount ? (
              <IconButton label="Cerrar sesión" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </IconButton>
            ) : (
              <button
                type="button"
                onClick={onExitDemo}
                title="Salir de la demo"
                aria-label="Salir de la demo"
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          {WORKSHOP_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onSelectTab(link.id)}
              className={`whitespace-nowrap shrink-0 ${
                currentTab === link.id
                  ? link.id === 'client_portal'
                    ? 'font-bold text-emerald-600 dark:text-emerald-400'
                    : 'font-bold text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {link.label}
              {link.id === 'orders' && activeOrdersCount > 0 ? ` (${activeOrdersCount})` : ''}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function WorkshopLink({
  link,
  currentTab,
  onSelectTab,
  activeOrdersCount,
  lowStockCount,
}: {
  link: { id: WorkshopTab; label: string };
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeOrdersCount: number;
  lowStockCount: number;
}) {
  const active = currentTab === link.id;
  const portal = link.id === 'client_portal';
  return (
    <button
      type="button"
      onClick={() => onSelectTab(link.id)}
      className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 py-5 border-b-2 ${
        active
          ? portal
            ? 'text-emerald-600 dark:text-emerald-400 font-bold border-emerald-600 dark:border-emerald-400'
            : 'text-indigo-600 dark:text-indigo-400 font-bold border-indigo-600 dark:border-indigo-400'
          : 'border-transparent hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {portal && <ExternalLink className="w-3.5 h-3.5" />}
      <span>{link.label}</span>
      {link.id === 'orders' && activeOrdersCount > 0 && (
        <span className="text-[10px] font-mono px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {activeOrdersCount}
        </span>
      )}
      {link.id === 'inventory' && lowStockCount > 0 && (
        <span className="text-[10px] font-mono px-1.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
          {lowStockCount} bajo
        </span>
      )}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}
