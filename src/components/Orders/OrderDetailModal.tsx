import React, { useState } from 'react';
import {
  X,
  Printer,
  MessageSquare,
  Mail,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Shield,
  Smartphone,
  CheckSquare,
  Square,
  DollarSign,
  Package
} from 'lucide-react';
import { RepairOrder, OrderStatus, InventoryPart, WorkshopSettings, PartUsage } from '../../types';
import {
  STATUS_CONFIG,
  formatCurrency,
  formatDateTime,
  calculateOrderTotals,
  DEVICE_LABELS
} from '../../utils/helpers';

interface OrderDetailModalProps {
  order: RepairOrder;
  inventoryParts: InventoryPart[];
  settings: WorkshopSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: RepairOrder) => void;
  onOpenNotification: (order: RepairOrder, channel: 'whatsapp' | 'email') => void;
  onOpenPrintTicket: (order: RepairOrder) => void;
  onViewAsClient: (orderNumber: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  inventoryParts,
  settings,
  isOpen,
  onClose,
  onUpdateOrder,
  onOpenNotification,
  onOpenPrintTicket,
  onViewAsClient
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'parts' | 'timeline'>('details');

  // Form states
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [technicianNotes, setTechnicianNotes] = useState(order.technicianNotes || '');
  const [initialDiagnosis, setInitialDiagnosis] = useState(order.initialDiagnosis || '');
  const [laborCost, setLaborCost] = useState(order.laborCost || 0);
  const [discount, setDiscount] = useState(order.discount || 0);
  const [depositPaid, setDepositPaid] = useState(order.depositPaid || 0);
  const [checklist, setChecklist] = useState(order.checklist);
  const [partsUsed, setPartsUsed] = useState<PartUsage[]>(order.partsUsed || []);

  // For adding part from inventory
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [partQty, setPartQty] = useState<number>(1);
  const [newLogNote, setNewLogNote] = useState<string>('');

  const totals = calculateOrderTotals({
    laborCost,
    partsUsed,
    discount,
    depositPaid
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    const timelineEntry = {
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: newStatus,
      title: `Estado cambiado a: ${STATUS_CONFIG[newStatus].label}`,
      note: `Actualizado por el técnico en sistema.`,
      user: order.assignedTechnician,
      channel: 'sistema' as const
    };

    const updated: RepairOrder = {
      ...order,
      status: newStatus,
      timeline: [timelineEntry, ...order.timeline],
      ...(newStatus === 'listo' ? { readyDate: new Date().toISOString() } : {}),
      ...(newStatus === 'entregado' ? { deliveredDate: new Date().toISOString() } : {})
    };

    onUpdateOrder(updated);

    // If marked ready, prompt to notify
    if (newStatus === 'listo') {
      onOpenNotification(updated, 'whatsapp');
    }
  };

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
  };

  const handleAddPart = () => {
    if (!selectedPartId) return;
    const invPart = inventoryParts.find((p) => p.id === selectedPartId);
    if (!invPart) return;

    const newUsage: PartUsage = {
      id: `puse-${Date.now()}`,
      partId: invPart.id,
      partName: invPart.name,
      category: invPart.category,
      quantity: Number(partQty) || 1,
      unitCost: invPart.costPrice,
      unitPrice: invPart.salePrice,
      source: invPart.source === 'recuperado_despiece' ? 'recuperado' : 'nuevo',
      donorDeviceId: invPart.donorDeviceId
    };

    const newParts = [...partsUsed, newUsage];
    setPartsUsed(newParts);
    setSelectedPartId('');
    setPartQty(1);

    // Append to timeline
    const updatedOrder: RepairOrder = {
      ...order,
      partsUsed: newParts,
      laborCost,
      discount,
      depositPaid,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: currentStatus,
          title: `Repuesto añadido: ${invPart.name}`,
          note: `Se asignó x${partQty} (${invPart.source === 'recuperado_despiece' ? 'Recuperado de despiece' : 'Nuevo'})`,
          user: order.assignedTechnician,
          channel: 'sistema'
        },
        ...order.timeline
      ]
    };
    onUpdateOrder(updatedOrder);
  };

  const handleRemovePart = (usageId: string) => {
    const filtered = partsUsed.filter((p) => p.id !== usageId);
    setPartsUsed(filtered);
    onUpdateOrder({
      ...order,
      partsUsed: filtered
    });
  };

  const handleSaveGeneral = () => {
    const updated: RepairOrder = {
      ...order,
      status: currentStatus,
      technicianNotes,
      initialDiagnosis,
      laborCost: Number(laborCost),
      discount: Number(discount),
      depositPaid: Number(depositPaid),
      checklist,
      partsUsed
    };
    onUpdateOrder(updated);
    alert('Cambios guardados con éxito.');
  };

  const handleAddLogNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const entry = {
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: currentStatus,
      title: 'Nota de bitácora técnica',
      note: newLogNote.trim(),
      user: order.assignedTechnician,
      channel: 'sistema' as const
    };

    const updated: RepairOrder = {
      ...order,
      timeline: [entry, ...order.timeline]
    };
    onUpdateOrder(updated);
    setNewLogNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded">
              {order.orderNumber}
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{order.brand} {order.model}</span>
                <span className="text-xs text-slate-500 font-normal">({order.clientName})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions in header */}
            <button
              onClick={() => onViewAsClient(order.orderNumber)}
              title="Ver cómo ve el cliente esta orden en tiempo real"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-md border border-emerald-200 dark:border-emerald-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver como Cliente</span>
            </button>

            <button
              onClick={() => onOpenPrintTicket(order)}
              title="Imprimir ticket para taller o cliente"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status bar trigger */}
        <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Estado de Orden:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="font-semibold px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(STATUS_CONFIG).map(([stKey, stVal]) => (
                <option key={stKey} value={stKey}>
                  {stVal.step > 0 ? `Paso ${stVal.step}: ` : ''}{stVal.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNotification(order, 'whatsapp')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notificar WhatsApp</span>
            </button>

            <button
              onClick={() => onOpenNotification(order, 'email')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Notificar Email</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6 bg-slate-50/50 dark:bg-slate-950/20">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Diagnóstico & Control de Calidad
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'parts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Repuestos & Presupuesto</span>
            {partsUsed.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                {partsUsed.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Bitácora & Historial de Cambios</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
              {order.timeline.length}
            </span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Customer & Device Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block">
                    Cliente & Contacto
                  </span>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {order.clientName}
                  </div>
                  <div className="space-y-0.5 text-slate-600 dark:text-slate-400">
                    <div>WhatsApp: <span className="font-mono font-medium text-slate-900 dark:text-white">{order.clientPhone}</span></div>
                    <div>Email: {order.clientEmail}</div>
                    {order.clientDocument && <div>DNI: {order.clientDocument}</div>}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block">
                    Equipo & Acceso
                  </span>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {order.brand} {order.model} ({DEVICE_LABELS[order.deviceType]})
                  </div>
                  <div className="space-y-0.5 text-slate-600 dark:text-slate-400">
                    <div>Serie/IMEI: <span className="font-mono text-slate-800 dark:text-slate-200">{order.serialOrImei || 'No provisto'}</span></div>
                    <div>PIN / Patrón: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{order.passcode || 'Sin clave'}</span></div>
                    <div>Condición Física: {order.physicalCondition}</div>
                  </div>
                </div>
              </div>

              {/* Reported Issue & Diagnosis */}
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    Falla Reportada por el Cliente al Ingreso:
                  </span>
                  <p className="text-amber-800 dark:text-amber-200">{order.reportedIssue}</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    Diagnóstico Técnico Inicial:
                  </label>
                  <textarea
                    rows={2}
                    value={initialDiagnosis}
                    onChange={(e) => setInitialDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                    placeholder="Detalle de fallas identificadas en banco de trabajo..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    Bitácora / Notas de la Intervención:
                  </label>
                  <textarea
                    rows={3}
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                    placeholder="Procedimiento realizado, observaciones, advertencias o consejos al cliente..."
                  />
                </div>
              </div>

              {/* Quality Checklist */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-2 text-xs">
                  Protocolo de Calidad & Pruebas Funcionales:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'encendido' as const, label: 'Encendido / Boot' },
                    { key: 'pantallaTactil' as const, label: 'Display & Táctil' },
                    { key: 'camaras' as const, label: 'Cámaras del/tras' },
                    { key: 'carga' as const, label: 'Carga & Batería' },
                    { key: 'audioMicrofono' as const, label: 'Altavoz & Mic' },
                    { key: 'wifiBluetooth' as const, label: 'Wi-Fi & Bluetooth' },
                    { key: 'botonesBiometria' as const, label: 'Botones / Huella' },
                    { key: 'senalesRed' as const, label: 'Señal Celular / SIM' }
                  ].map((item) => {
                    const isChecked = checklist[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleToggleChecklist(item.key)}
                        className={`flex items-center gap-2 p-2 rounded border text-left transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-[11px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs"
                >
                  Guardar Cambios de Diagnóstico
                </button>
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-6">
              {/* Add part selector */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">
                  Asignar Repuesto del Inventario o Despiece
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
                  >
                    <option value="">-- Seleccionar pieza del inventario --</option>
                    {inventoryParts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.name} ({part.source === 'recuperado_despiece' ? '♻️ Recuperado' : 'Nuevo'}) · Stock: {part.stock} · ${part.salePrice}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={partQty}
                      onChange={(e) => setPartQty(Number(e.target.value))}
                      className="w-16 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-center font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPart}
                      disabled={!selectedPartId}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-md text-xs whitespace-nowrap cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Repuesto</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of assigned parts */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block mb-2">
                  Repuestos Utilizados en esta Orden
                </span>
                {partsUsed.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400">
                    No se han asignado piezas de repuesto todavía. Solo se cobrará mano de obra.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <tr>
                          <th className="p-2.5">Repuesto</th>
                          <th className="p-2.5">Origen</th>
                          <th className="p-2.5 text-center">Cant.</th>
                          <th className="p-2.5 text-right">Precio Unit.</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                          <th className="p-2.5 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {partsUsed.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                              {p.partName}
                            </td>
                            <td className="p-2.5">
                              {p.source === 'recuperado' ? (
                                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                  ♻️ Despiece Recuperado
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                                  Nuevo de Fábrica
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-mono">{p.quantity}</td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatCurrency(p.unitPrice, settings.currencySymbol)}
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold tabular-nums">
                              {formatCurrency(p.unitPrice * p.quantity, settings.currencySymbol)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePart(p.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Financial summary calculations */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">
                  Cálculo de Presupuesto y Cobro
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1">Mano de Obra ($)</label>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1">Descuento ($)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1">Seña / Abono Pagado ($)</label>
                    <input
                      type="number"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <div>Repuestos: <span className="font-mono font-semibold">{formatCurrency(totals.partsTotal, settings.currencySymbol)}</span></div>
                    <div>Mano de obra: <span className="font-mono">{formatCurrency(totals.laborCost, settings.currencySymbol)}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">Total Presupuesto: <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(totals.total, settings.currencySymbol)}</span></div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold">Saldo a Cobrar: <span className="font-mono text-base">{formatCurrency(totals.balance, settings.currencySymbol)}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs"
                >
                  Guardar Presupuesto
                </button>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Form to add note */}
              <form onSubmit={handleAddLogNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribir una nota rápida en la bitácora técnica..."
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
                />
                <button
                  type="submit"
                  disabled={!newLogNote.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-md text-xs whitespace-nowrap"
                >
                  Registrar Nota
                </button>
              </form>

              {/* Timeline list */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                {order.timeline.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {entry.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDateTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{entry.note}</p>
                      <div className="text-[10px] text-slate-400">
                        <span>Por: {entry.user}</span>
                        {entry.channel && (
                          <>
                            <span className="mx-1">·</span>
                            <span className="uppercase font-mono">{entry.channel}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
