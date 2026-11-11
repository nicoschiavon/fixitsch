import React from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import { RepairOrder, WorkshopSettings } from '../../types';
import { formatCurrency, formatDateTime, calculateOrderTotals, DEVICE_LABELS } from '../../utils/helpers';

interface PrintTicketModalProps {
  order: RepairOrder;
  settings: WorkshopSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({
  order,
  settings,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const totals = calculateOrderTotals(order);
  const portalUrl = `${window.location.origin}?order=${order.orderNumber}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top bar controls (no-print) */}
        <div className="no-print px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Vista Previa de Comprobante / Ticket de Ingreso</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans print:p-0 print:text-[11px]">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {settings.workshopName}
              </h1>
              <p className="text-[11px] text-slate-600">{settings.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {settings.address} · {settings.city}
              </p>
              <p className="text-[10px] text-slate-500">
                WhatsApp/Tel: {settings.phone} · {settings.taxId}
              </p>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm tracking-widest rounded">
                {order.orderNumber}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Fecha: {formatDateTime(order.createdAt)}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">
                Técnico: {order.assignedTechnician}
              </p>
            </div>
          </div>

          {/* Client & Device Grid */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Datos del Cliente
              </span>
              <p className="font-bold text-sm text-slate-900">{order.clientName}</p>
              <p>Tel: {order.clientPhone}</p>
              <p>Email: {order.clientEmail}</p>
              {order.clientDocument && <p>DNI/Doc: {order.clientDocument}</p>}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Dispositivo Recibido
              </span>
              <p className="font-bold text-sm text-slate-900">
                {order.brand} {order.model}
              </p>
              <p>Tipo: {DEVICE_LABELS[order.deviceType]}</p>
              <p className="font-mono">IMEI / Serie: {order.serialOrImei || 'No provisto'}</p>
              <p>Color: {order.color || 'No especificado'}</p>
            </div>
          </div>

          {/* Technical Intake details */}
          <div className="space-y-2 border border-slate-200 p-3 rounded bg-slate-50">
            <div>
              <span className="font-bold text-slate-700">Falla o Síntoma Reportado:</span>
              <p className="mt-0.5 text-slate-800 italic bg-white p-2 border border-slate-200 rounded">
                "{order.reportedIssue}"
              </p>
            </div>
            {order.physicalCondition && (
              <div>
                <span className="font-bold text-slate-700">Estado Físico / Detalles Cosméticos:</span>
                <p className="text-slate-700">{order.physicalCondition}</p>
              </div>
            )}
            {order.accessoriesIncluded && (
              <div>
                <span className="font-bold text-slate-700">Accesorios Dejados en Recepción:</span>
                <p className="text-slate-700">{order.accessoriesIncluded}</p>
              </div>
            )}
            {order.passcode && (
              <div>
                <span className="font-bold text-slate-700">PIN / Clave de Acceso:</span>
                <span className="font-mono ml-1 font-semibold">{order.passcode}</span>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-700 flex justify-between">
              <span>Concepto</span>
              <span>Subtotal</span>
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex justify-between">
                <span>Mano de Obra y Revisión Técnica:</span>
                <span className="font-mono font-medium">{formatCurrency(totals.laborCost, settings.currencySymbol)}</span>
              </div>
              {order.partsUsed.map((p, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>Repuesto: {p.partName} (x{p.quantity})</span>
                  <span className="font-mono font-medium">{formatCurrency(p.unitPrice * p.quantity, settings.currencySymbol)}</span>
                </div>
              ))}
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descuento aplicado:</span>
                  <span className="font-mono">-{formatCurrency(totals.discount, settings.currencySymbol)}</span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm">
                <span>TOTAL PRESUPUESTO:</span>
                <span className="font-mono">{formatCurrency(totals.total, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Seña / Abono entregado:</span>
                <span className="font-mono font-semibold">-{formatCurrency(totals.depositPaid, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-indigo-700 bg-indigo-50 p-2 rounded">
                <span>SALDO PENDIENTE AL RETIRAR:</span>
                <span className="font-mono">{formatCurrency(totals.balance, settings.currencySymbol)}</span>
              </div>
            </div>
          </div>

          {/* QR Code and Online tracking badge */}
          <div className="border border-dashed border-slate-300 p-3 rounded flex items-center justify-between bg-slate-50">
            <div>
              <p className="font-bold text-slate-900">Seguimiento Online 24/7</p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Consulte el avance, diagnóstico y apruebe presupuestos escaneando o ingresando a:
              </p>
              <p className="font-mono text-[10px] text-indigo-600 underline mt-0.5">{portalUrl}</p>
            </div>
            <div className="p-2 bg-white border border-slate-300 rounded flex flex-col items-center">
              <QrCode className="w-12 h-12 text-slate-800" />
              <span className="text-[8px] font-mono mt-0.5">ORD #{order.orderNumber}</span>
            </div>
          </div>

          {/* Legal and terms */}
          <div className="text-[9px] text-slate-500 leading-tight border-t border-slate-200 pt-2 space-y-1">
            <p><strong>Garantía:</strong> {order.warrantyDays || settings.defaultWarrantyDays} días sobre los trabajos efectuados y piezas reemplazadas. No cubre caídas, roturas de cristal, ni daños por humedad sobrevinientes.</p>
            <p><strong>Términos:</strong> {settings.termsConditions}</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center">
            <div>
              <div className="border-b border-slate-400 h-10 w-4/5 mx-auto"></div>
              <p className="text-[10px] mt-1 font-semibold text-slate-700">Firma del Cliente</p>
              <p className="text-[9px] text-slate-400">Aceptación de condiciones de ingreso</p>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10 w-4/5 mx-auto"></div>
              <p className="text-[10px] mt-1 font-semibold text-slate-700">Por {settings.workshopName}</p>
              <p className="text-[9px] text-slate-400">Recepción autorizada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
