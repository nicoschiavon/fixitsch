import React, { useState } from 'react';
import {
  Search,
  History,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Tablet,
  Laptop,
  Calendar,
  CheckCircle,
  Eye,
  TrendingUp,
  Award
} from 'lucide-react';
import { RepairOrder, WorkshopSettings, DeviceType } from '../../types';
import { formatCurrency, formatDate, calculateOrderTotals, DEVICE_LABELS } from '../../utils/helpers';

interface RepairHistoryProps {
  orders: RepairOrder[];
  settings: WorkshopSettings;
  onSelectOrder: (order: RepairOrder) => void;
}

export const RepairHistory: React.FC<RepairHistoryProps> = ({
  orders,
  settings,
  onSelectOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [filterWarranty, setFilterWarranty] = useState<'all' | 'active' | 'expired'>('all');

  // Compute warranties and history
  const historyOrders = orders.filter((o) => {
    const isCompleted = o.status === 'entregado' || o.status === 'listo';
    // If user is searching specifically, search across all orders
    return searchQuery ? true : isCompleted;
  });

  const checkWarranty = (order: RepairOrder) => {
    if (!order.readyDate && !order.deliveredDate) return { active: false, daysLeft: 0, text: 'No finalizado' };
    const finishDate = new Date(order.deliveredDate || order.readyDate!);
    const warrantyDays = order.warrantyDays || settings.defaultWarrantyDays;
    const expiryDate = new Date(finishDate);
    expiryDate.setDate(expiryDate.getDate() + warrantyDays);

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      active: diffDays > 0,
      daysLeft: Math.max(0, diffDays),
      expiryDate: expiryDate.toISOString().slice(0, 10),
      text: diffDays > 0 ? `Vigente (${diffDays} días rest.)` : 'Vencida'
    };
  };

  const filtered = historyOrders.filter((o) => {
    const matchesSearch =
      searchQuery === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientPhone.includes(searchQuery) ||
      o.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.serialOrImei && o.serialOrImei.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDevice = filterDevice === 'all' || o.deviceType === filterDevice;

    const wInfo = checkWarranty(o);
    const matchesWarranty =
      filterWarranty === 'all'
        ? true
        : filterWarranty === 'active'
        ? wInfo.active
        : !wInfo.active;

    return matchesSearch && matchesDevice && matchesWarranty;
  });

  // Analytics
  const deliveredOrders = orders.filter((o) => o.status === 'entregado');
  const totalBilled = deliveredOrders.reduce((acc, o) => acc + calculateOrderTotals(o).total, 0);
  const smartphonesCount = orders.filter((o) => o.deviceType === 'smartphone').length;
  const tabletsCount = orders.filter((o) => o.deviceType === 'tablet').length;
  const notebooksCount = orders.filter((o) => o.deviceType === 'notebook').length;

  return (
    <div className="space-y-6">
      {/* Analytics KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Reparaciones Históricas</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {orders.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{deliveredOrders.length} entregadas y cobradas</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Facturación Acumulada</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(totalBilled, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Mano de obra + piezas</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Distribución por Dispositivo</div>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span>📱 {smartphonesCount}</span>
            <span>·</span>
            <span>📟 {tabletsCount}</span>
            <span>·</span>
            <span>💻 {notebooksCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Especialidad multimarca</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Garantía del Taller</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {settings.defaultWarrantyDays} DÍAS
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Trazabilidad de partes y seriales</div>
        </div>
      </div>

      {/* Search by IMEI / Serial / Client */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por IMEI / N° de Serie, Nombre de Cliente, Teléfono o Falla previa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">Todos los Equipos</option>
              <option value="smartphone">Celulares</option>
              <option value="tablet">Tablets</option>
              <option value="notebook">Notebooks</option>
            </select>

            <select
              value={filterWarranty}
              onChange={(e) => setFilterWarranty(e.target.value as any)}
              className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">Todas las Garantías</option>
              <option value="active">Garantía Vigente</option>
              <option value="expired">Garantía Vencida</option>
            </select>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Orden</th>
                <th className="py-3 px-4 font-semibold">Cliente & Teléfono</th>
                <th className="py-3 px-4 font-semibold">Equipo & Serial/IMEI</th>
                <th className="py-3 px-4 font-semibold">Intervención / Repuestos</th>
                <th className="py-3 px-4 font-semibold">Estado de Garantía</th>
                <th className="py-3 px-4 font-semibold text-right">Total Cobrado</th>
                <th className="py-3 px-4 font-semibold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron registros en el historial con esos criterios.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const totals = calculateOrderTotals(order);
                  const wInfo = checkWarranty(order);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {order.orderNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.clientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.clientPhone}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {order.brand} {order.model}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IMEI: {order.serialOrImei || 'N/D'}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <p className="truncate text-slate-700 dark:text-slate-300">
                          {order.technicianNotes || order.reportedIssue}
                        </p>
                        <div className="text-[10px] text-slate-400">
                          {order.partsUsed.length > 0
                            ? `${order.partsUsed.map((p) => p.partName).join(', ')}`
                            : 'Mano de obra y calibración'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {wInfo.active ? (
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{wInfo.text}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                              <span>Garantía Vencida</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(totals.total, settings.currencySymbol)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded"
                          title="Ver detalles completos de la reparación"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
