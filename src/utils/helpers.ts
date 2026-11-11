import { OrderStatus, DeviceType, Priority } from '../types';

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; step: number; description: string }
> = {
  ingresado: {
    label: 'Ingresado',
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-700',
    step: 1,
    description: 'Equipo recibido en recepción y asignado a banco'
  },
  diagnostico: {
    label: 'En Diagnóstico',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
    step: 2,
    description: 'Técnico evaluando fallas y componentes'
  },
  presupuestado: {
    label: 'Presupuestado',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
    step: 3,
    description: 'Esperando confirmación del cliente'
  },
  aprobado: {
    label: 'Aprobado',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-300 dark:border-indigo-800',
    step: 4,
    description: 'Presupuesto aceptado por el cliente'
  },
  esperando_repuesto: {
    label: 'Esperando Repuesto',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-800',
    step: 4,
    description: 'Pieza pedida a proveedor o de despiece'
  },
  en_reparacion: {
    label: 'En Reparación',
    color: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-300 dark:border-violet-800',
    step: 5,
    description: 'Trabajo técnico activo en laboratorio'
  },
  control_calidad: {
    label: 'Control de Calidad',
    color: 'text-teal-700 dark:text-teal-300',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-300 dark:border-teal-800',
    step: 6,
    description: 'Pruebas de estrés y checklist técnico'
  },
  listo: {
    label: 'Listo para Retirar',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    step: 7,
    description: 'Reparación completada y verificada'
  },
  entregado: {
    label: 'Entregado',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-200 dark:border-slate-700',
    step: 8,
    description: 'Equipo retirado y cobrado'
  },
  cancelado: {
    label: 'Cancelado / Rechazado',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-800',
    step: 0,
    description: 'Equipo no reparado o presupuesto rechazado'
  }
};

export const DEVICE_LABELS: Record<DeviceType, string> = {
  smartphone: 'Celular / Smartphone',
  tablet: 'Tablet / iPad',
  notebook: 'Notebook / Laptop',
  otro: 'Otro Dispositivo'
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  normal: { label: 'Normal', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  alta: { label: 'Alta', color: 'text-amber-800 dark:text-amber-200', bg: 'bg-amber-100 dark:bg-amber-900/50' },
  urgente: { label: 'Urgente', color: 'text-rose-800 dark:text-rose-200', bg: 'bg-rose-100 dark:bg-rose-900/50' }
};

export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol} ${Number(amount || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function calculateOrderTotals(order: {
  laborCost: number;
  partsUsed: Array<{ unitPrice: number; quantity: number }>;
  discount: number;
  depositPaid: number;
}) {
  const partsTotal = (order.partsUsed || []).reduce(
    (sum, p) => sum + (p.unitPrice || 0) * (p.quantity || 1),
    0
  );
  const subtotal = (order.laborCost || 0) + partsTotal;
  const total = Math.max(0, subtotal - (order.discount || 0));
  const balance = Math.max(0, total - (order.depositPaid || 0));
  return {
    partsTotal,
    laborCost: order.laborCost || 0,
    subtotal,
    discount: order.discount || 0,
    total,
    depositPaid: order.depositPaid || 0,
    balance
  };
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
