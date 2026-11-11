import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  Building,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { TrialAccount, WorkshopSettings } from '../../types';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateTrial: (account: TrialAccount) => void;
  currentSettings: WorkshopSettings;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  onActivateTrial,
  currentSettings
}) => {
  if (!isOpen) return null;

  const [workshopName, setWorkshopName] = useState(
    currentSettings.workshopName === 'TechRepair Pro' ? 'Mi Taller FixiTsch' : currentSettings.workshopName
  );
  const [ownerName, setOwnerName] = useState('Nico Schiavon');
  const [email, setEmail] = useState('nico.schiavon@gmail.com');
  const [whatsapp, setWhatsapp] = useState('5491145678900');
  const [techniciansCount, setTechniciansCount] = useState<number>(2);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([
    'Celulares',
    'Tablets',
    'Notebooks'
  ]);

  const toggleDevice = (dev: string) => {
    if (selectedDevices.includes(dev)) {
      if (selectedDevices.length > 1) {
        setSelectedDevices(selectedDevices.filter((d) => d !== dev));
      }
    } else {
      setSelectedDevices([...selectedDevices, dev]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopName || !ownerName || !email || !whatsapp) {
      alert('Por favor complete todos los datos.');
      return;
    }

    const start = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 15);

    const newTrial: TrialAccount = {
      active: true,
      workshopName,
      ownerName,
      email,
      whatsapp,
      techniciansCount,
      devices: selectedDevices,
      startedAt: start.toISOString(),
      expiresAt: expires.toISOString(),
      isSubscribed: false
    };

    onActivateTrial(newTrial);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg bg-black/10 hover:bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Prueba Gratuita por 15 Días</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            Comenzar con FixiTsch Pro
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            Acceso completo e ilimitado por 15 días a todas las funciones del software. Sin tarjeta de crédito requerida.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Nombre de tu Taller / Laboratorio *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: FixiTsch Belgrano"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Tu Nombre y Apellido *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Nico Schiavon"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nico.schiavon@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                WhatsApp de Contacto *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="5491145678900"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Cantidad de Técnicos en Banco
              </label>
              <select
                value={techniciansCount}
                onChange={(e) => setTechniciansCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value={1}>1 Técnico (Unipersonal)</option>
                <option value={2}>2 a 3 Técnicos</option>
                <option value={5}>4 a 7 Técnicos</option>
                <option value={10}>Más de 8 Técnicos</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Dispositivos que Atienden
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Celulares', 'Tablets', 'Notebooks', 'Consolas'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDevice(d)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                      selectedDevices.includes(d)
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>15 días de prueba completa con órdenes, inventario y despiece ilimitados.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tus datos y órdenes se guardan automáticamente en tu navegador.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Luego podrás suscribirte al Plan Pro por solo <strong>$30.000 ARS/mes</strong>.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-all"
            >
              Activar Mi Prueba de 15 Días
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
