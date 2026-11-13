import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  MessageSquare,
  Phone,
  MapPin,
  Shield,
  Smartphone,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { RepairOrder, WorkshopSettings, OrderStatus } from '../../types';
import {
  STATUS_CONFIG,
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateOrderTotals,
  buildWhatsAppLink,
  DEVICE_LABELS
} from '../../utils/helpers';

interface CustomerPortalViewProps {
  orders: RepairOrder[];
  settings: WorkshopSettings;
  initialOrderNumber?: string;
  onUpdateOrder: (order: RepairOrder) => void;
  onBackToAdmin?: () => void;
  backLabel?: string;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  orders,
  settings,
  initialOrderNumber,
  onUpdateOrder,
  onBackToAdmin,
  backLabel = 'Volver al Panel de Taller'
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderNumber || 'ORD-1042');
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    } else {
      // Default to first active order or ready order
      const defaultOrd = orders.find((o) => o.status === 'listo') || orders[0];
      if (defaultOrd) {
        setSelectedOrder(defaultOrd);
        setSearchInput(defaultOrd.orderNumber);
      }
    }
  }, [initialOrderNumber, orders]);

  const handleSearch = (query: string) => {
    setErrorMessage('');
    setActionFeedback(null);
    const cleanQuery = query.trim().toUpperCase();

    if (!cleanQuery) {
      setErrorMessage('Por favor ingrese un número de orden o teléfono.');
      return;
    }

    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === cleanQuery ||
        o.orderNumber.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '') ||
        o.clientPhone.includes(cleanQuery)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      setSelectedOrder(null);
      setErrorMessage(`No se encontró ninguna orden con el código "${query}". Verifique el número de su comprobante.`);
    }
  };

  const handleApproveBudget = () => {
    if (!selectedOrder) return;
    const updated: RepairOrder = {
      ...selectedOrder,
      status: 'aprobado',
      budgetStatus: 'aprobado',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'aprobado',
          title: 'Presupuesto Aprobado por el Cliente',
          note: 'Confirmación online registrada desde el Portal del Cliente.',
          user: selectedOrder.clientName,
          channel: 'cliente'
        },
        ...selectedOrder.timeline
      ]
    };
    onUpdateOrder(updated);
    setSelectedOrder(updated);
    setActionFeedback('¡Presupuesto aprobado con éxito! El equipo pasará a banco de reparación.');
  };

  const handleRejectBudget = () => {
    if (!selectedOrder) return;
    if (!confirm('¿Está seguro de que desea rechazar el presupuesto? Se detendrá la reparación del equipo.')) return;

    const updated: RepairOrder = {
      ...selectedOrder,
      status: 'cancelado',
      budgetStatus: 'rechazado',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'cancelado',
          title: 'Presupuesto Rechazado por el Cliente',
          note: 'El cliente declinó la cotización desde el Portal Web.',
          user: selectedOrder.clientName,
          channel: 'cliente'
        },
        ...selectedOrder.timeline
      ]
    };
    onUpdateOrder(updated);
    setSelectedOrder(updated);
    setActionFeedback('Has rechazado el presupuesto. El equipo quedará disponible para retiro en recepción.');
  };

  const totals = selectedOrder ? calculateOrderTotals(selectedOrder) : null;
  const isReady = selectedOrder?.status === 'listo';
  const isDelivered = selectedOrder?.status === 'entregado';
  const isBudget = selectedOrder?.status === 'presupuestado';

  // Step milestones for visual pipeline
  const steps = [
    { key: 'ingresado', label: '1. Ingresado', stepNum: 1 },
    { key: 'diagnostico', label: '2. Diagnóstico', stepNum: 2 },
    { key: 'presupuestado', label: '3. Presupuesto', stepNum: 3 },
    { key: 'en_reparacion', label: '4. Reparación', stepNum: 5 },
    { key: 'control_calidad', label: '5. Pruebas', stepNum: 6 },
    { key: 'listo', label: '6. Listo para Retirar', stepNum: 7 },
    { key: 'entregado', label: '7. Entregado', stepNum: 8 }
  ];

  const currentStepNum = selectedOrder ? STATUS_CONFIG[selectedOrder.status]?.step || 1 : 1;

  // Contact technician message
  const waContactMessage = selectedOrder
    ? `Hola ${settings.workshopName}, consulto por mi orden #${selectedOrder.orderNumber} (${selectedOrder.brand} ${selectedOrder.model}) a nombre de ${selectedOrder.clientName}.`
    : `Hola ${settings.workshopName}, quiero consultar por el estado de una reparación.`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Customer Portal Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300">
              {settings.workshopName} · Portal de Seguimiento
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Consulta de Estado en Tiempo Real
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Ingrese el número de su comprobante (ej: <span className="font-mono text-indigo-300">ORD-1042</span>) o teléfono para ver el avance y presupuesto de su equipo.
            </p>
          </div>

          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg backdrop-blur-xs whitespace-nowrap self-start sm:self-center"
            >
              <span>{backLabel}</span>
            </button>
          )}
        </div>

        {/* Search input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchInput);
          }}
          className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Número de orden (ej: ORD-1042) o teléfono..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            Consultar Estado
          </button>
        </form>

        {/* Quick chip examples */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>Órdenes de demostración:</span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setSearchInput(o.orderNumber);
                handleSearch(o.orderNumber);
              }}
              className="font-mono text-indigo-300 hover:underline hover:text-white"
            >
              {o.orderNumber} ({o.model})
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action feedback */}
      {actionFeedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Selected Order Display */}
      {selectedOrder && totals && (
        <div className="space-y-6">
          {/* Main Status Milestone Progress Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-500 font-mono">
                  ORDEN DE SERVICIO #{selectedOrder.orderNumber}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedOrder.brand} {selectedOrder.model}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Titular: <strong>{selectedOrder.clientName}</strong> · Ingresado el: {formatDate(selectedOrder.createdAt)}
                </div>
              </div>

              {/* Ready / Status badge */}
              <div className="text-left sm:text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    isReady
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300'
                      : isDelivered
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-300'
                  }`}
                >
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </span>
                <div className="text-[11px] text-slate-500 mt-1">
                  Técnico: {selectedOrder.assignedTechnician}
                </div>
              </div>
            </div>

            {/* Special Callout: Ready for Pickup! */}
            {isReady && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>¡Tu equipo ya se encuentra reparado y listo para retirar!</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Todas las pruebas de control de calidad resultaron exitosas. Puedes pasar por nuestro local en <strong>{settings.address}</strong> durante nuestro horario habitual.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
                  <span>Saldo a abonar al retirar:</span>
                  <span className="font-mono text-base font-bold">{formatCurrency(totals.balance, settings.currencySymbol)}</span>
                </div>
              </div>
            )}

            {/* Step Pipeline Visualization */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Progreso de la Reparación:
              </div>
              <div className="relative pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {steps.map((st) => {
                    const isDone = currentStepNum >= st.stepNum;
                    const isCurrent = STATUS_CONFIG[selectedOrder.status]?.step === st.stepNum;

                    return (
                      <div
                        key={st.key}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                            : isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 font-medium'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="text-[11px] font-semibold">{st.label}</div>
                        <div className="text-[9px] mt-0.5 opacity-80">
                          {isCurrent ? 'En proceso' : isDone ? 'Completado' : 'Pendiente'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Budget Approval Callout (if waiting client approval) */}
            {isBudget && (
              <div className="p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      Presupuesto Listo para su Aprobación
                    </h3>
                    <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                      Nuestro equipo técnico completó la revisión de su {selectedOrder.brand} {selectedOrder.model}. Para comenzar con la reparación, solicitamos su confirmación del presupuesto.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleApproveBudget}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Aprobar Presupuesto ({formatCurrency(totals.total, settings.currencySymbol)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectBudget}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold rounded-lg cursor-pointer transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details & Financial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Inspection & Findings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Informe Técnico del Laboratorio</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block">Falla Reportada:</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 italic">
                    "{selectedOrder.reportedIssue}"
                  </p>
                </div>

                {selectedOrder.initialDiagnosis && (
                  <div>
                    <span className="font-semibold text-slate-500 block">Diagnóstico del Técnico:</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedOrder.initialDiagnosis}
                    </p>
                  </div>
                )}

                {selectedOrder.technicianNotes && (
                  <div>
                    <span className="font-semibold text-slate-500 block">Intervención Realizada:</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedOrder.technicianNotes}
                    </p>
                  </div>
                )}

                {/* Quality checks */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Chequeos Técnicos de Funcionamiento:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(selectedOrder.checklist).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            val ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                        <span className={val ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400'}>
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Garantía otorgada: <strong>{selectedOrder.warrantyDays || settings.defaultWarrantyDays} días</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Desglose de Costos & Presupuesto</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Mano de obra y revisión:</span>
                  <span className="font-mono font-medium">{formatCurrency(totals.laborCost, settings.currencySymbol)}</span>
                </div>

                {selectedOrder.partsUsed.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>
                      {p.partName} {p.quantity > 1 ? `(x${p.quantity})` : ''}
                    </span>
                    <span className="font-mono font-medium">{formatCurrency(p.unitPrice * p.quantity, settings.currencySymbol)}</span>
                  </div>
                ))}

                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Descuento de cortesía:</span>
                    <span className="font-mono">-{formatCurrency(totals.discount, settings.currencySymbol)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>Presupuesto Total:</span>
                  <span className="font-mono">{formatCurrency(totals.total, settings.currencySymbol)}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Abono / Seña entregada al ingreso:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(totals.depositPaid, settings.currencySymbol)}
                  </span>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex justify-between items-center font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Saldo a Cancelar al Retirar:</span>
                  <span className="font-mono text-lg text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(totals.balance, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Contact Button */}
              <div className="pt-3">
                <a
                  href={buildWhatsAppLink(settings.phone, waContactMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Consultar con el Técnico por WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          </div>

          {/* Workshop Contact & Pickup details */}
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Retiro en:</strong> {settings.address}, {settings.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Teléfono Taller:</strong> {settings.phone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
