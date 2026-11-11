import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../../types';
import { loadStoredUsersList } from '../../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signup'
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [googleStep, setGoogleStep] = useState<'idle' | 'pick_account'>('idle');

  // Form states
  const [name, setName] = useState('Nico Schiavon');
  const [email, setEmail] = useState('nico.schiavon@gmail.com');
  const [workshopName, setWorkshopName] = useState('FixiTsch Lab');
  const [password, setPassword] = useState('******');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Accounts mock / chooser
  const googleAccountsList = [
    {
      name: 'Nico Schiavon',
      email: 'nico.schiavon@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      initials: 'NS'
    },
    {
      name: 'Laboratorio FixiTsch',
      email: 'contacto@fixitsch.com',
      avatarUrl: '',
      initials: 'LF'
    }
  ];

  const handleGoogleSignInClick = () => {
    setGoogleStep('pick_account');
  };

  const handleSelectGoogleAccount = (acc: { name: string; email: string; avatarUrl?: string }) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newUser: UserAccount = {
        id: `usr_${Date.now()}_${acc.email.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: acc.name,
        email: acc.email,
        avatarUrl: acc.avatarUrl,
        provider: 'google',
        role: 'registered_full_access',
        workshopName: workshopName || `${acc.name} Tech Lab`,
        createdAt: new Date().toISOString(),
        hasPersistence: true,
        planStatus: 'full_access_free_promo'
      };

      setIsSubmitting(false);
      setGoogleStep('idle');
      onSuccess(newUser);
      onClose();
    }, 600);
  };

  const handleCustomGoogleSubmit = (customEmail: string, customName: string) => {
    if (!customEmail) return;
    handleSelectGoogleAccount({
      name: customName || customEmail.split('@')[0],
      email: customEmail
    });
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const existingUsers = loadStoredUsersList();
      const found = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (mode === 'login' && found) {
        onSuccess(found);
      } else {
        const newUser: UserAccount = {
          id: `usr_${Date.now()}`,
          name: name || email.split('@')[0],
          email,
          provider: 'email',
          role: 'registered_full_access',
          workshopName: workshopName || 'FixiTsch Lab',
          createdAt: new Date().toISOString(),
          hasPersistence: true,
          planStatus: 'full_access_free_promo'
        };
        onSuccess(newUser);
      }

      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-lg bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Acceso Completo 100% Bonificado</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'signup' ? 'Crear Cuenta en FixiTsch' : 'Iniciar Sesión en FixiTsch'}
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            {mode === 'signup'
              ? 'Guardá tus órdenes, inventario y despiece de forma permanente sin pagar nada.'
              : 'Ingresá a tu laboratorio con persistencia de datos activa.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {googleStep === 'pick_account' ? (
            /* Google Account Chooser */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Seleccionar cuenta de Google
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleStep('idle')}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Volver
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Seleccioná una cuenta de Google para iniciar sesión o registrarte inmediatamente con acceso completo:
              </p>

              <div className="space-y-2">
                {googleAccountsList.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {acc.initials}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {acc.email}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Custom Google Email input */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  O usar otra cuenta de Google (@gmail.com):
                </span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="tu.cuenta@gmail.com"
                    defaultValue="otro.correo@gmail.com"
                    id="custom-google-email"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('custom-google-email') as HTMLInputElement;
                      if (input && input.value) {
                        handleCustomGoogleSubmit(input.value, input.value.split('@')[0]);
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg"
                  >
                    Ingresar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Main Form with Google Button */
            <>
              {/* Prominent Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:border-slate-400"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{mode === 'signup' ? 'Crear cuenta con Google' : 'Continuar con Google'}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                <span className="text-[11px] text-slate-400 font-mono">o con correo</span>
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                        Tu Nombre
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nico Schiavon"
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                        Nombre de tu Taller / Laboratorio
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                          placeholder="FixiTsch Lab Norte"
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Free full access reminder */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    <strong>Acceso Completo Bonificado:</strong> Sin costo inicial ni tarjeta requerida.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  {isSubmitting
                    ? 'Procesando...'
                    : mode === 'signup'
                    ? 'Crear Cuenta y Activar Acceso Completo'
                    : 'Ingresar a mi Cuenta'}
                </button>
              </form>

              {/* Switch mode */}
              <div className="text-center pt-2 text-[11px] text-slate-500">
                {mode === 'signup' ? (
                  <span>
                    ¿Ya tenés una cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Iniciar Sesión
                    </button>
                  </span>
                ) : (
                  <span>
                    ¿No tenés cuenta aún?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Crear Cuenta Gratis
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
