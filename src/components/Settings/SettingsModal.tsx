import React, { useEffect, useState } from 'react';
import {
  X,
  Settings,
  RefreshCw,
  Building,
  Shield,
  ImagePlus,
  Download
} from 'lucide-react';
import { WorkshopSettings } from '../../types';
import { isLogoDataUrl, LOGO_ACCEPT, readLogoFile } from '../../utils/logo';
interface SettingsModalProps {
  settings: WorkshopSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: WorkshopSettings) => void;
  onReloadAllData: () => void;
  persisted?: boolean;
  onClearData: () => void | Promise<void>;
  onExportData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
  onReloadAllData,
  persisted = false,
  onClearData,
  onExportData
}) => {
  const [formData, setFormData] = useState<WorkshopSettings>({ ...settings });
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFormData({ ...settings });
    setLogoError('');
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (field: keyof WorkshopSettings, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoFile = async (file: File | undefined) => {
    if (!file) return;
    setLogoError('');
    try {
      const logoDataUrl = await readLogoFile(file);
      setFormData((prev) => ({ ...prev, logoDataUrl }));
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : 'No se pudo leer el logo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    alert('Configuración guardada correctamente.');
    onClose();
  };

  const handleReset = async () => {
    const message = persisted
      ? '¿Vaciar los datos de esta cuenta? Se borran órdenes, inventario y despiece. No se tocan otras cuentas.'
      : '¿Restablecer el entorno de prueba a los datos de muestra?';
    if (!confirm(message)) return;
    await onClearData();
    onReloadAllData();
    alert(persisted ? 'La cuenta quedó vacía.' : 'Datos de prueba restablecidos.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configuración del Taller & Plantillas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Workshop Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Datos del Laboratorio / Taller</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Nombre Comercial del Taller *</label>
                <input
                  type="text"
                  required
                  value={formData.workshopName}
                  onChange={(e) => handleChange('workshopName', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Subtítulo / Especialidad</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Teléfono / WhatsApp de Contacto</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email del Taller</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Dirección del Local</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Identificación Fiscal (CUIT / RFC / RUT)</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Logo del taller</label>
                <div className="flex items-center gap-3">
                  {formData.logoDataUrl && isLogoDataUrl(formData.logoDataUrl) ? (
                    <img
                      src={formData.logoDataUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Elegir imagen</span>
                      <input
                        type="file"
                        accept={LOGO_ACCEPT}
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = '';
                          void handleLogoFile(file);
                        }}
                      />
                    </label>
                    {formData.logoDataUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoError('');
                          setFormData((prev) => ({ ...prev, logoDataUrl: '' }));
                        }}
                        className="px-3 py-1.5 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md"
                      >
                        Quitar logo
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Se muestra en la barra, junto al nombre. PNG, JPG, WebP o GIF, hasta 120 KB.
                </p>
                {logoError && <p className="mt-1 text-[11px] text-rose-600">{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Warranty and Currency */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Garantía y Moneda</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Días de Garantía por Defecto</label>
                <input
                  type="number"
                  value={formData.defaultWarrantyDays}
                  onChange={(e) => handleChange('defaultWarrantyDays', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Símbolo Monetario</label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Términos y Condiciones para el Comprobante Impreso</label>
              <textarea
                rows={2}
                value={formData.termsConditions}
                onChange={(e) => handleChange('termsConditions', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span>Copia de Seguridad & Datos</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Copia de Seguridad JSON</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-900 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{persisted ? 'Vaciar datos de esta cuenta' : 'Restablecer datos demo'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs cursor-pointer"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
