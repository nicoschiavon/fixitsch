import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Moon,
  Sun,
  Plus,
  Settings,
  ExternalLink,
  Smartphone,
  Sparkles,
  Zap,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { UserAccount, TrialAccount } from '../types';

interface NavbarProps {
  currentTab: 'landing' | 'orders' | 'inventory' | 'teardown' | 'history' | 'client_portal';
  onSelectTab: (tab: 'landing' | 'orders' | 'inventory' | 'teardown' | 'history' | 'client_portal') => void;
  onOpenNewOrder: () => void;
  onOpenSettings: () => void;
  onOpenTrialModal: () => void;
  onOpenCheckoutModal: () => void;
  onOpenAuthModal: (mode?: 'signup' | 'login') => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeOrdersCount: number;
  lowStockCount: number;
  trial: TrialAccount;
  currentUser: UserAccount | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewOrder,
  onOpenSettings,
  onOpenTrialModal,
  onOpenCheckoutModal,
  onOpenAuthModal,
  onLogout,
  isDark,
  onToggleTheme,
  activeOrdersCount,
  lowStockCount,
  trial,
  currentUser
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  FixiT<span className="text-indigo-600 dark:text-indigo-400">sch</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider">
                  GESTIÓN DE SERVICIO TÉCNICO
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onSelectTab('landing')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'landing'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 py-5'
                  : 'py-5'
              }`}
            >
              <span>Inicio</span>
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'orders'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 py-5'
                  : 'py-5'
              }`}
            >
              <span>Órdenes</span>
              {activeOrdersCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('inventory')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'inventory'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 py-5'
                  : 'py-5'
              }`}
            >
              <span>Inventario</span>
              {lowStockCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  {lowStockCount} bajo
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('teardown')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'teardown'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 py-5'
                  : 'py-5'
              }`}
            >
              <span>Despiece / Huesera</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'history'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 py-5'
                  : 'py-5'
              }`}
            >
              <span>Historial</span>
            </button>

            <button
              onClick={() => onSelectTab('client_portal')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                currentTab === 'client_portal'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400 py-5'
                  : 'py-5'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Portal Clientes</span>
            </button>
          </nav>

          {/* Zone 3: Account & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status / Role indication */}
            {currentUser && currentUser.hasPersistence ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block truncate max-w-[120px]">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Acceso Completo
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</div>
                      <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Acceso Completo (100% Gratis)</span>
                      </div>
                    </div>

                    <div className="px-4 py-2 text-[11px] text-slate-500 space-y-1">
                      <div>Taller: <strong>{currentUser.workshopName}</strong></div>
                      <div>Persistencia: <span className="text-emerald-600 font-semibold">Activa</span></div>
                      <div>Proveedor: <span className="capitalize">{currentUser.provider}</span></div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión (Volver a Modo Demo)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest / Demo User */
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded border border-amber-300 dark:border-amber-800">
                  <span>Modo Demo (Sin persistencia)</span>
                </span>

                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-all whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Crear Cuenta Gratis</span>
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Configuración de taller y plantillas"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Configuración"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* New Order Button */}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 gap-3 text-xs">
          <button
            onClick={() => onSelectTab('landing')}
            className={`whitespace-nowrap ${currentTab === 'landing' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Inicio
          </button>
          <button
            onClick={() => onSelectTab('orders')}
            className={`whitespace-nowrap ${currentTab === 'orders' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Órdenes ({activeOrdersCount})
          </button>
          <button
            onClick={() => onSelectTab('inventory')}
            className={`whitespace-nowrap ${currentTab === 'inventory' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Inventario
          </button>
          <button
            onClick={() => onSelectTab('teardown')}
            className={`whitespace-nowrap ${currentTab === 'teardown' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Despiece
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`whitespace-nowrap ${currentTab === 'history' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Historial
          </button>
          <button
            onClick={() => onSelectTab('client_portal')}
            className={`whitespace-nowrap flex items-center gap-1 ${currentTab === 'client_portal' ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Smartphone className="w-3 h-3" />
            Portal
          </button>
        </div>
      </div>
    </header>
  );
};
