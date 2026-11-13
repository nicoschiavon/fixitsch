import React, { useEffect, useState } from 'react';
import { X, Lock, User, Building, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../../types';
import { ApiError, login, register, toUserAccount } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void | Promise<void>;
  initialMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [name, setName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError('');
    setPassword('');
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response =
        mode === 'login'
          ? await login(username, password)
          : await register({
              username,
              password,
              name: name || username,
              workshopName: workshopName || `Taller de ${name || username}`,
            });
      await onSuccess(toUserAccount(response.user));
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar el ingreso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-lg bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[11px] font-semibold mb-2 border border-indigo-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cada taller ve solo sus datos</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'signup' ? 'Crear cuenta del taller' : 'Iniciar sesión'}
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            {mode === 'signup'
              ? 'La cuenta nace vacía. Nadie más, ni el administrador, puede ver lo que cargues.'
              : 'Entrá con tu usuario. Vas a ver únicamente los datos de tu taller.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-3 text-xs text-slate-700 dark:text-slate-300">
          {mode === 'signup' && (
            <>
              <label className="block">
                <span className="font-semibold text-slate-900 dark:text-white">Tu nombre</span>
                <div className="relative mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nombre del dueño"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </label>
              <label className="block">
                <span className="font-semibold text-slate-900 dark:text-white">Nombre del taller</span>
                <div className="relative mt-1">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={workshopName}
                    onChange={(event) => setWorkshopName(event.target.value)}
                    placeholder="Mi taller"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </label>
            </>
          )}

          <label className="block">
            <span className="font-semibold text-slate-900 dark:text-white">Usuario</span>
            <div className="relative mt-1">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="usuario"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </label>

          <label className="block">
            <span className="font-semibold text-slate-900 dark:text-white">Contraseña</span>
            <div className="relative mt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
          >
            {isSubmitting ? 'Procesando...' : mode === 'signup' ? 'Crear cuenta vacía' : 'Entrar a mi taller'}
          </button>

          <div className="text-center pt-2 text-[11px] text-slate-500">
            {mode === 'signup' ? (
              <span>
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Iniciar sesión
                </button>
              </span>
            ) : (
              <span>
                ¿Todavía no tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Crear una
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
