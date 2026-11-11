import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Sparkles,
  Zap,
  ArrowRight,
  Lock
} from 'lucide-react';
import { TrialAccount, WorkshopSettings } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: (plan: 'mensual_30k' | 'anual_300k', paymentMethod: string) => void;
  trial: TrialAccount;
  settings: WorkshopSettings;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionSuccess,
  trial,
  settings
}) => {
  if (!isOpen) return null;

  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transferencia' | 'tarjeta'>('mercadopago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const priceAmount = billingCycle === 'mensual' ? 30000 : 300000;
  const priceDisplay = billingCycle === 'mensual' ? '$30.000 ARS / mes' : '$300.000 ARS / año (2 meses bonificados)';

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSubscriptionSuccess(
          billingCycle === 'mensual' ? 'mensual_30k' : 'anual_300k',
          paymentMethod
        );
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>FixiTsch Pro · Suscripción Oficial</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Plan Taller Pro — $30.000 ARS / mes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Plan Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('mensual')}
              className={`py-3 px-4 rounded-lg font-bold text-center transition-all ${
                billingCycle === 'mensual'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <div className="text-sm font-black">$30.000 ARS</div>
              <div className="text-[10px] font-normal text-slate-500">Facturación Mensual</div>
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle('anual')}
              className={`py-3 px-4 rounded-lg font-bold text-center transition-all ${
                billingCycle === 'anual'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <div className="text-sm font-black">$300.000 ARS</div>
              <div className="text-[10px] font-normal text-emerald-600 font-semibold">
                Anual · Ahorrá 2 meses
              </div>
            </button>
          </div>

          {/* Included Features */}
          <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="font-bold text-slate-900 dark:text-white text-xs mb-2">
              Todo lo que incluye el Plan FixiTsch Pro:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {[
                'Órdenes de servicio ilimitadas',
                'Notificaciones por WhatsApp en 1 clic',
                'Avisos por Correo Electrónico',
                'Módulo exclusivo de Despiece & Huesera',
                'Portal Web propio para que clientes consulten',
                'Aprobación digital de presupuestos online',
                'Control de stock, alertas y gavetas físicas',
                'Búsqueda por IMEI y control de garantías',
                'Comprobante / Ticket térmico imprimible',
                'Soporte técnico y actualizaciones continuas'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-900 dark:text-white text-xs">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mercadopago')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'mercadopago'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs">Mercado Pago</div>
                <div className="text-[10px] text-slate-500 mt-0.5">QR / Dinero en cuenta</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs">Transferencia</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Alias / CBU</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'tarjeta'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs">Tarjeta Déb./Créd.</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Visa / Mastercard</div>
              </button>
            </div>

            {/* Payment details box */}
            {paymentMethod === 'transferencia' && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-mono space-y-1">
                <div><strong>Banco:</strong> Banco Galicia / Mercado Pago</div>
                <div><strong>Titular:</strong> Nico Schiavon</div>
                <div><strong>Alias CBU:</strong> FIXITSCH.PAGO</div>
                <div><strong>CUIT:</strong> 20-36891204-9</div>
              </div>
            )}

            {paymentMethod === 'mercadopago' && (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg text-[11px] text-sky-800 dark:text-sky-200 flex items-center justify-between">
                <span>Cobro automático o manual mediante Mercado Pago Argentina en pesos (ARS).</span>
                <span className="font-bold font-mono">CVU Inmediato</span>
              </div>
            )}
          </div>

          {/* Guarantee / Security */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pago seguro. Cancelación en cualquier momento sin penalidad ni permanencia mínima.</span>
          </div>

          {success && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>¡Pago acreditado exitosamente! Tu cuenta FixiTsch Pro ya está activa.</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isProcessing || success}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-all"
            >
              {isProcessing ? (
                <span>Procesando pago...</span>
              ) : success ? (
                <span>¡Suscripción Lista!</span>
              ) : (
                <>
                  <span>Suscribirme por {priceDisplay}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
