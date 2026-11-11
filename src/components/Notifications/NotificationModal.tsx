import React, { useState } from 'react';
import {
  MessageSquare,
  Mail,
  X,
  Send,
  ExternalLink,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles
} from 'lucide-react';
import { RepairOrder, WorkshopSettings } from '../../types';
import { formatCurrency, buildWhatsAppLink, calculateOrderTotals } from '../../utils/helpers';

interface NotificationModalProps {
  order: RepairOrder;
  settings: WorkshopSettings;
  isOpen: boolean;
  onClose: () => void;
  onRecordNotification: (orderId: string, channel: 'whatsapp' | 'email', messageSummary: string) => void;
  defaultChannel?: 'whatsapp' | 'email';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onRecordNotification,
  defaultChannel = 'whatsapp'
}) => {
  if (!isOpen) return null;

  const [channel, setChannel] = useState<'whatsapp' | 'email'>(defaultChannel);
  const [copied, setCopied] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const totals = calculateOrderTotals(order);
  const portalUrl = `${window.location.origin}?order=${order.orderNumber}`;

  // Default text templates
  const isReady = order.status === 'listo';
  const isBudget = order.status === 'presupuestado';

  let subject = `Su ${order.brand} ${order.model} está listo para retirar - ${settings.workshopName}`;
  if (isBudget) {
    subject = `Presupuesto de reparación disponible para su ${order.brand} ${order.model} (Orden #${order.orderNumber})`;
  } else if (order.status === 'en_reparacion') {
    subject = `Actualización de reparación: ${order.brand} ${order.model} en proceso`;
  }

  // Pre-fill WhatsApp message
  let defaultWhatsAppText = '';
  if (isReady) {
    defaultWhatsAppText = `¡Hola ${order.clientName}! 👋 Te avisamos de ${settings.workshopName} que tu ${order.brand} ${order.model} (Orden #${order.orderNumber}) ya está LISTO para retirar.\n\n` +
      `💰 Saldo a abonar: ${formatCurrency(totals.balance, settings.currencySymbol)}\n` +
      `📍 Retiro en: ${settings.address}\n` +
      `🛡️ Garantía: ${order.warrantyDays || settings.defaultWarrantyDays} días.\n\n` +
      `Podés consultar el comprobante en tiempo real aquí:\n${portalUrl}`;
  } else if (isBudget) {
    defaultWhatsAppText = `¡Hola ${order.clientName}! 👋 De ${settings.workshopName} te enviamos el presupuesto para la reparación de tu ${order.brand} ${order.model} (Orden #${order.orderNumber}).\n\n` +
      `🔧 Falla: ${order.reportedIssue}\n` +
      `💵 Presupuesto Total: ${formatCurrency(totals.total, settings.currencySymbol)}\n\n` +
      `Podés revisar el desglose y APROBAR el presupuesto desde este link:\n${portalUrl}`;
  } else {
    defaultWhatsAppText = `¡Hola ${order.clientName}! Te escribimos de ${settings.workshopName} para informarte sobre tu ${order.brand} ${order.model} (Orden #${order.orderNumber}).\n\n` +
      `Estado actual: ${order.status.toUpperCase()}\n` +
      `Seguimiento online: ${portalUrl}`;
  }

  const [customMessage, setCustomMessage] = useState(defaultWhatsAppText);

  const handleOpenWhatsApp = () => {
    const link = buildWhatsAppLink(order.clientPhone, customMessage);
    window.open(link, '_blank');
    onRecordNotification(order.id, 'whatsapp', `Notificación WhatsApp enviada (${order.status})`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSendEmail = () => {
    setEmailSentSuccess(true);
    onRecordNotification(order.id, 'email', `Correo electrónico enviado a ${order.clientEmail} (${subject})`);
    setTimeout(() => {
      setEmailSentSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>Notificaciones Automáticas</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span className="font-mono font-medium">{order.orderNumber}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Notificar al Cliente ({order.clientName})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setChannel('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp ({order.clientPhone})</span>
          </button>
          <button
            onClick={() => setChannel('email')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              channel === 'email'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email ({order.clientEmail})</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {channel === 'whatsapp' ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                <span>
                  El botón abrirá WhatsApp Web o la App oficial con el texto ya formateado.
                </span>
                <span className="font-mono text-[11px] font-semibold">{order.clientPhone}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mensaje a enviar:
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Para:</span>{' '}
                    {order.clientEmail}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">De:</span>{' '}
                    {settings.email}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">Asunto:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{subject}</div>
                </div>

                {/* Email HTML simulation preview */}
                <div className="mt-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs space-y-3">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {settings.workshopName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{order.orderNumber}</span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200">
                    Estimado/a <strong>{order.clientName}</strong>,
                  </p>

                  {isReady ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-900 dark:text-emerald-200 text-xs">
                      ✅ <strong>Su dispositivo ya se encuentra 100% reparado y probado</strong> en nuestro laboratorio.
                    </div>
                  ) : isBudget ? (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded text-blue-900 dark:text-blue-200 text-xs">
                      📋 <strong>Presupuesto generado</strong> para la reparación solicitada.
                    </div>
                  ) : null}

                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                    <div><strong>Dispositivo:</strong> {order.brand} {order.model} ({order.color})</div>
                    <div><strong>Problema:</strong> {order.reportedIssue}</div>
                    <div><strong>Técnico Asignado:</strong> {order.assignedTechnician}</div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-semibold text-slate-900 dark:text-white">
                      <span>Total Reparación:</span>
                      <span className="tabular-nums font-mono">{formatCurrency(totals.total, settings.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>Saldo Pendiente al Retirar:</span>
                      <span className="tabular-nums font-mono">{formatCurrency(totals.balance, settings.currencySymbol)}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-4 py-2 bg-indigo-600 text-white font-medium text-xs rounded hover:bg-indigo-700"
                    >
                      Consultar Estado y Comprobante en Línea
                    </a>
                  </div>

                  <div className="text-[11px] text-slate-400 text-center pt-2">
                    {settings.address} · Tel: {settings.phone}
                  </div>
                </div>
              </div>

              {emailSentSuccess && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Correo enviado con éxito y registrado en el historial de la orden!</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar Correo Ahora</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
