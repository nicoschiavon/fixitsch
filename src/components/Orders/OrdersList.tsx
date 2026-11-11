import React, { useState } from 'react';
import {
  Search,
  Filter,
  Smartphone,
  Tablet,
  Laptop,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Printer,
  ChevronRight,
  ExternalLink,
  Plus,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { RepairOrder, OrderStatus, DeviceType, WorkshopSettings } from '../../types';
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatCurrency,
  formatDate,
  calculateOrderTotals,
  DEVICE_LABELS
} from '../../utils/helpers';

interface OrdersListProps {
  orders: RepairOrder[];
  settings: WorkshopSettings;
  onSelectOrder: (order: RepairOrder) => void;
  onOpenNewOrder: () => void;
  onOpenNotification: (order: RepairOrder, channel: 'whatsapp' | 'email') => void;
  onOpenPrintTicket: (order: RepairOrder) => void;
  onViewAsClient: (orderNumber: string) => void;
  onQuickChangeStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  settings,
  onSelectOrder,
  onOpenNewOrder,
  onOpenNotification,
  onOpenPrintTicket,
  onViewAsClient,
  onQuickChangeStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search query
    const matchSearch =
      searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientPhone.includes(searchTerm) ||
      order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.serialOrImei && order.serialOrImei.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'activas'
        ? order.status !== 'entregado' && order.status !== 'cancelado'
        : order.status === statusFilter;

    // Device filter
    const matchDevice = deviceFilter === 'all' || order.deviceType === deviceFilter;

    return matchSearch && matchStatus && matchDevice;
  });

  // KPI Calculations
  const activeCount = orders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado').length;
  const readyCount = orders.filter((o) => o.status === 'listo').length;
  const inRepairCount = orders.filter((o) => o.status === 'en_reparacion' || o.status === 'diagnostico').length;
  const waitingApprovalCount = orders.filter((o) => o.status === 'presupuestado').length;

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'smartphone':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-500" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-blue-500" />;
      case 'notebook':
        return <Laptop className="w-3.5 h-3.5 text-violet-500" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Órdenes Activas</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">En taller actualmente</div>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
          <div className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">Listos para Retirar</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
            {readyCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Requieren notificación</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">En Reparación / Banco</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {inRepairCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Con técnico asignado</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Esperando Aprobación</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {waitingApprovalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Presupuesto enviado</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, N° orden (ORD-1042), teléfono, modelo, IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2">
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">Todos los Equipos</option>
              <option value="smartphone">📱 Celulares</option>
              <option value="tablet">📟 Tablets</option>
              <option value="notebook">💻 Notebooks</option>
            </select>

            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>

        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'activas', label: `Activas (${activeCount})` },
            { id: 'ingresado', label: 'Ingresados' },
            { id: 'diagnostico', label: 'En Diagnóstico' },
            { id: 'presupuestado', label: 'Presupuestados' },
            { id: 'en_reparacion', label: 'En Reparación' },
            { id: 'listo', label: `Listos (${readyCount})` },
            { id: 'entregado', label: 'Entregados' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No se encontraron órdenes con los filtros seleccionados
          </p>
          <p className="text-xs text-slate-500">
            Intente cambiar el término de búsqueda o cree una nueva orden de servicio.
          </p>
          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Ingresar Nueva Orden</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Orden</th>
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Dispositivo</th>
                  <th className="py-3 px-4 font-semibold">Falla Reportada</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Saldo Pendiente</th>
                  <th className="py-3 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.ingresado;
                  const totals = calculateOrderTotals(order);
                  const isReady = order.status === 'listo';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Order # and Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {order.orderNumber}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.clientName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <span>{order.clientPhone}</span>
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          {getDeviceIcon(order.deviceType)}
                          <span>
                            {order.brand} {order.model}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {order.color} {order.serialOrImei ? `· ${order.serialOrImei}` : ''}
                        </div>
                      </td>

                      {/* Issue */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="truncate text-slate-600 dark:text-slate-300" title={order.reportedIssue}>
                          {order.reportedIssue}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Técnico: {order.assignedTechnician}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        {isReady && (
                          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            ¡Listo para entregar!
                          </div>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(totals.balance, settings.currencySymbol)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Total: {formatCurrency(totals.total, settings.currencySymbol)}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* WhatsApp Notification Button */}
                          <button
                            onClick={() => onOpenNotification(order, 'whatsapp')}
                            title={`Enviar WhatsApp a ${order.clientName}`}
                            className={`p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-colors ${
                              isReady ? 'ring-1 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' : ''
                            }`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Print ticket */}
                          <button
                            onClick={() => onOpenPrintTicket(order)}
                            title="Imprimir ticket de ingreso"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* View as Client */}
                          <button
                            onClick={() => onViewAsClient(order.orderNumber)}
                            title="Ver en portal de clientes"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Open Detail */}
                          <button
                            onClick={() => onSelectOrder(order)}
                            title="Ver y editar orden completa"
                            className="p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
