import React from 'react';
import { Clock, FlaskConical, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';

interface PendingAccessScreenProps {
  workshopName: string;
  onEnterDemo: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export const PendingAccessScreen: React.FC<PendingAccessScreenProps> = ({
  workshopName,
  onEnterDemo,
  onRefresh,
  onLogout,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Tu cuenta está esperando aprobación
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {workshopName ? <><strong>{workshopName}</strong> todavía no tiene la prueba activada.</> : 'La cuenta todavía no tiene la prueba activada.'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            La cuenta principal revisa cada alta y activa la prueba de 15 días. Cuando lo haga,
            vas a poder entrar al taller con tus propios datos.
          </p>

          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Tu taller nace vacío. Nadie más, ni el administrador, ve lo que cargues.</span>
            </li>
            <li className="flex items-start gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>Mientras esperás, podés probar el demo con datos de muestra. No se guarda nada.</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={onEnterDemo}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-xs"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Probar el demo</span>
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Verificar de nuevo</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
