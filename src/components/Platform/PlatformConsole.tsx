import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  CreditCard,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  ApiError,
  extendPlatformTrial,
  listPlatformTenants,
  reactivatePlatformTenant,
  recordPlatformPayment,
  startPlatformTrial,
  suspendPlatformTenant,
  type PlatformTenant,
} from '../../api/client';
import type { TenantStatus } from '../../types';

const STATUS_STYLE: Record<TenantStatus, { label: string; className: string }> = {
  sandbox: {
    label: 'Sandbox',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  trial: {
    label: 'Prueba',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
  },
  active: {
    label: 'Activa',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  expired: {
    label: 'Vencida',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
  },
  cancelled: {
    label: 'Suspendida',
    className: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  },
};

const PLAN_LABEL: Record<'monthly' | 'yearly', string> = {
  monthly: 'Mensual',
  yearly: 'Anual',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

function paymentLabel(plan: 'monthly' | 'yearly'): string {
  return plan === 'monthly'
    ? 'Cobrar mensual ($30.000 ARS)'
    : 'Cobrar anual ($300.000 ARS)';
}

export const PlatformConsole: React.FC = () => {
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await listPlatformTenants();
      setTenants(result.tenants);
      setError('');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el listado de talleres.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (
    tenant: PlatformTenant,
    question: string,
    action: () => Promise<unknown>
  ) => {
    if (!confirm(question)) return;
    setBusyId(tenant.id);
    setError('');
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo completar la operación.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = tenants.filter((tenant) => tenant.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Consola de plataforma
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Suscripciones y pruebas de los talleres. No muestra datos de clientes ni equipos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-2.5 py-1.5">
            {pendingCount} pendiente{pendingCount === 1 ? '' : 's'} de aprobación
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[68rem] w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">
              <tr>
                <th className="px-3 py-2.5 font-bold">Taller</th>
                <th className="px-3 py-2.5 font-bold">Dueño</th>
                <th className="px-3 py-2.5 font-bold">Estado</th>
                <th className="px-3 py-2.5 font-bold">Prueba</th>
                <th className="px-3 py-2.5 font-bold">Plan / período</th>
                <th className="px-3 py-2.5 font-bold">Último pago</th>
                <th className="px-3 py-2.5 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    Cargando talleres...
                  </td>
                </tr>
              )}
              {!loading && tenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    Todavía no hay talleres registrados.
                  </td>
                </tr>
              )}
              {tenants.map((tenant) => {
                const style = STATUS_STYLE[tenant.status];
                const busy = busyId === tenant.id;
                const readOnly =
                  tenant.access.canRead && !tenant.access.canWrite && tenant.status !== 'pending';
                return (
                  <tr key={tenant.id} className="align-top">
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {tenant.workshopName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Alta: {formatDate(tenant.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {tenant.ownerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {tenant.ownerUsername}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${style.className}`}>
                        {style.label}
                      </span>
                      {readOnly && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                          Solo lectura
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      <div>Fin: {formatDate(tenant.trialEndsAt)}</div>
                      <div className="text-[11px] text-slate-400">
                        Inicio: {formatDate(tenant.trialStartedAt)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      <div>{tenant.plan ? PLAN_LABEL[tenant.plan] : 'Sin plan'}</div>
                      <div className="text-[11px] text-slate-400">
                        Hasta: {formatDate(tenant.currentPeriodEnd)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      {formatDate(tenant.lastPaymentAt)}
                    </td>
                    <td className="px-3 py-3">
                      {tenant.status === 'sandbox' ? (
                        <span className="text-[11px] text-slate-400">
                          Sandbox propio. No se opera desde acá.
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {tenant.status === 'pending' && (
                            <ActionButton
                              disabled={busy}
                              icon={<Play className="w-3.5 h-3.5" />}
                              label="Aceptar prueba"
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Activar la prueba de "${tenant.workshopName}"?`,
                                  () => startPlatformTrial(tenant.id)
                                )
                              }
                            />
                          )}

                          {(tenant.status === 'trial' || tenant.status === 'expired') && (
                            <ActionButton
                              disabled={busy}
                              icon={<CalendarPlus className="w-3.5 h-3.5" />}
                              label="Extender 15 días"
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Extender 15 días la prueba de "${tenant.workshopName}"?`,
                                  () => extendPlatformTrial(tenant.id, 15)
                                )
                              }
                            />
                          )}

                          {(tenant.status === 'expired' || tenant.status === 'cancelled') && (
                            <ActionButton
                              disabled={busy}
                              icon={<RotateCcw className="w-3.5 h-3.5" />}
                              label="Reactivar"
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Reactivar "${tenant.workshopName}"? Si no hay período vigente, queda en solo lectura.`,
                                  () => reactivatePlatformTenant(tenant.id)
                                )
                              }
                            />
                          )}

                          {tenant.status === 'trial' && (
                            <ActionButton
                              disabled={busy}
                              icon={<Pause className="w-3.5 h-3.5" />}
                              label="Suspender"
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Suspender "${tenant.workshopName}"?`,
                                  () => suspendPlatformTenant(tenant.id)
                                )
                              }
                            />
                          )}

                          {tenant.status === 'active' && (
                            <ActionButton
                              disabled={busy}
                              icon={<Pause className="w-3.5 h-3.5" />}
                              label="Suspender"
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Suspender "${tenant.workshopName}"?`,
                                  () => suspendPlatformTenant(tenant.id)
                                )
                              }
                            />
                          )}

                          {tenant.status !== 'pending' && (
                            <ActionButton
                              disabled={busy}
                              icon={<CreditCard className="w-3.5 h-3.5" />}
                              label={paymentLabel('monthly')}
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Registrar el pago mensual de "${tenant.workshopName}" por $30.000 ARS?`,
                                  () => recordPlatformPayment(tenant.id, 'monthly')
                                )
                              }
                            />
                          )}

                          {tenant.status !== 'pending' && (
                            <ActionButton
                              disabled={busy}
                              icon={<CreditCard className="w-3.5 h-3.5" />}
                              label={paymentLabel('yearly')}
                              onClick={() =>
                                void run(
                                  tenant,
                                  `¿Registrar el pago anual de "${tenant.workshopName}" por $300.000 ARS?`,
                                  () => recordPlatformPayment(tenant.id, 'yearly')
                                )
                              }
                            />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        El importe y el fin del período los calcula el servidor desde el plan. La cuenta del creador
        no puede operar sobre su propio sandbox.
      </p>
    </div>
  );
};

function ActionButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
