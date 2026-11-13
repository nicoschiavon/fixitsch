import React, { useState, useEffect, useRef } from 'react';
import {
  RepairOrder,
  InventoryPart,
  DonorDevice,
  WorkshopSettings,
  OrderStatus,
  SalvagePart,
  TrialAccount,
  UserAccount
} from './types';
import { loadStoredTrial, saveStoredTrial } from './utils/storage';
import {
  clearWorkshop,
  currentAccount,
  loadWorkshop,
  logout as logoutAccount,
  saveDonors,
  saveOrders,
  saveParts,
  saveSettings,
  toUserAccount
} from './api/client';
import { INITIAL_ORDERS, INITIAL_PARTS, INITIAL_DONOR_DEVICES, INITIAL_SETTINGS } from './data/initialData';
import { resolveShellMode, visibleSection, type AppTab } from './utils/appShell';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/Landing/LandingPage';
import { OrdersList } from './components/Orders/OrdersList';
import { NewOrderModal } from './components/Orders/NewOrderModal';
import { OrderDetailModal } from './components/Orders/OrderDetailModal';
import { PrintTicketModal } from './components/Orders/PrintTicketModal';
import { InventoryManager } from './components/Inventory/InventoryManager';
import { TeardownManager } from './components/Teardown/TeardownManager';
import { CustomerPortalView } from './components/CustomerPortal/CustomerPortalView';
import { RepairHistory } from './components/History/RepairHistory';
import { NotificationModal } from './components/Notifications/NotificationModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { TrialModal } from './components/Subscription/TrialModal';
import { CheckoutModal } from './components/Subscription/CheckoutModal';
import { AuthModal } from './components/Auth/AuthModal';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const accountRef = useRef<UserAccount | null>(null);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());

  const [orders, setOrders] = useState<RepairOrder[]>(INITIAL_ORDERS);
  const [parts, setParts] = useState<InventoryPart[]>(INITIAL_PARTS);
  const [donors, setDonors] = useState<DonorDevice[]>(INITIAL_DONOR_DEVICES);
  const [settings, setSettings] = useState<WorkshopSettings>(INITIAL_SETTINGS);
  const [trial, setTrial] = useState<TrialAccount>(loadStoredTrial);

  useEffect(() => {
    let cancelled = false;
    currentAccount()
      .then(async (account) => {
        if (cancelled || !account) return;
        const user = toUserAccount(account);
        const data = await loadWorkshop();
        if (cancelled) return;
        accountRef.current = user;
        setCurrentUser(user);
        setDemoActive(false);
        setOrders(data.orders);
        setParts(data.parts);
        setDonors(data.donors);
        setSettings(data.settings);
        setCurrentTab((tab) => (tab === 'landing' ? 'orders' : tab));
      })
      .catch(() => {
        accountRef.current = null;
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [currentTab, setCurrentTab] = useState<AppTab>('landing');
  const [demoActive, setDemoActive] = useState(false);

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('techrepair_theme_v1') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('techrepair_theme_v1', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('techrepair_theme_v1', 'light');
    }
  }, [isDark]);

  // URL query check: e.g. ?order=ORD-1042
  const [portalOrderQuery, setPortalOrderQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order');
    if (orderParam) {
      setPortalOrderQuery(orderParam);
      setCurrentTab('client_portal');
    }
  }, []);

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<RepairOrder | null>(null);
  const [notificationTarget, setNotificationTarget] = useState<{
    order: RepairOrder;
    channel: 'whatsapp' | 'email';
  } | null>(null);
  const [printTicketOrder, setPrintTicketOrder] = useState<RepairOrder | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');

  // Authentication Handlers
  const handleOpenAuth = (mode: 'signup' | 'login' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const applyWorkshop = (data: {
    orders: RepairOrder[];
    parts: InventoryPart[];
    donors: DonorDevice[];
    settings: WorkshopSettings;
  }) => {
    setOrders(data.orders);
    setParts(data.parts);
    setDonors(data.donors);
    setSettings(data.settings);
  };

  const clearOrderQuery = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('order')) {
      url.searchParams.delete('order');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
    setPortalOrderQuery(undefined);
  };

  const resetDemoMemory = () => {
    setOrders(INITIAL_ORDERS);
    setParts(INITIAL_PARTS);
    setDonors(INITIAL_DONOR_DEVICES);
    setSettings(INITIAL_SETTINGS);
  };

  const enterDemo = (tab: AppTab = 'orders') => {
    if (accountRef.current) {
      setCurrentTab(tab === 'landing' ? 'orders' : tab);
      return;
    }
    if (!demoActive) {
      resetDemoMemory();
      clearOrderQuery();
    }
    setDemoActive(true);
    setCurrentTab(tab === 'landing' ? 'orders' : tab);
  };

  const closeWorkshopChrome = () => {
    setIsNewOrderOpen(false);
    setIsSettingsOpen(false);
    setSelectedOrderForDetail(null);
    setNotificationTarget(null);
    setPrintTicketOrder(null);
  };

  const exitDemo = () => {
    closeWorkshopChrome();
    setDemoActive(false);
    resetDemoMemory();
    clearOrderQuery();
    setCurrentTab('landing');
  };

  const goHome = () => {
    if (accountRef.current) {
      setCurrentTab('orders');
      return;
    }
    closeWorkshopChrome();
    setDemoActive(false);
    clearOrderQuery();
    setCurrentTab('landing');
  };

  const handleLoginSuccess = async (user: UserAccount) => {
    localStorage.removeItem('fixitsch_current_user_v2');
    accountRef.current = user;
    setCurrentUser(user);
    setDemoActive(false);
    clearOrderQuery();
    applyWorkshop(await loadWorkshop());
    setCurrentTab('orders');
  };

  const handleLogout = async () => {
    accountRef.current = null;
    try {
      await logoutAccount();
    } catch {
      // La sesión local se cierra igual si el servidor no responde.
    }
    setCurrentUser(null);
    setDemoActive(false);
    closeWorkshopChrome();
    resetDemoMemory();
    clearOrderQuery();
    setCurrentTab('landing');
  };

  const handleResetDemoData = () => {
    if (confirm('¿Restablecer el entorno de prueba a los datos de muestra iniciales?')) {
      setOrders(INITIAL_ORDERS);
      setParts(INITIAL_PARTS);
      setDonors(INITIAL_DONOR_DEVICES);
      setSettings(INITIAL_SETTINGS);
      alert('Datos de prueba restablecidos en memoria.');
    }
  };

  const persist = (task: () => Promise<unknown>) => {
    if (!accountRef.current) return;
    saveChain.current = saveChain.current
      .then(task)
      .catch(() => {
        alert('No se pudieron guardar los datos de esta cuenta.');
      });
  };

  const handleUpdateOrders = (newOrders: RepairOrder[]) => {
    setOrders(newOrders);
    persist(() => saveOrders(newOrders));
  };

  const handleUpdateParts = (newParts: InventoryPart[]) => {
    setParts(newParts);
    persist(() => saveParts(newParts));
  };

  const handleUpdateDonors = (newDonors: DonorDevice[]) => {
    setDonors(newDonors);
    persist(() => saveDonors(newDonors));
  };

  const handleSaveSettings = (newSettings: WorkshopSettings) => {
    setSettings(newSettings);
    persist(() => saveSettings(newSettings));
  };

  const handleReloadAll = async () => {
    if (!accountRef.current) return;
    applyWorkshop(await loadWorkshop());
    setTrial(loadStoredTrial());
  };

  const handleClearAccount = async () => {
    if (!accountRef.current) {
      setOrders(INITIAL_ORDERS);
      setParts(INITIAL_PARTS);
      setDonors(INITIAL_DONOR_DEVICES);
      setSettings(INITIAL_SETTINGS);
      return;
    }
    applyWorkshop(await clearWorkshop());
  };

  // Trial & Subscription Handlers
  const handleActivateTrial = (newTrial: TrialAccount) => {
    setTrial(newTrial);
    saveStoredTrial(newTrial);

    if (newTrial.workshopName && newTrial.workshopName !== settings.workshopName) {
      const updatedSettings = {
        ...settings,
        workshopName: newTrial.workshopName,
        phone: newTrial.whatsapp || settings.phone,
        email: newTrial.email || settings.email
      };
      handleSaveSettings(updatedSettings);
    }

    if (!accountRef.current) setDemoActive(true);
    setCurrentTab('orders');
  };

  const handleSubscriptionSuccess = (plan: 'mensual_30k' | 'anual_300k', paymentMethod: string) => {
    const updatedTrial: TrialAccount = {
      ...trial,
      isSubscribed: true,
      subscriptionPlan: plan,
      subscriptionDate: new Date().toISOString(),
      paymentMethod
    };
    setTrial(updatedTrial);
    saveStoredTrial(updatedTrial);
  };

  // Order Handlers
  const handleCreateOrder = (newOrder: RepairOrder) => {
    const updated = [newOrder, ...orders];
    handleUpdateOrders(updated);
  };

  const handleSaveOrderChanges = (updatedOrder: RepairOrder) => {
    const updated = orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    handleUpdateOrders(updated);
    if (selectedOrderForDetail?.id === updatedOrder.id) {
      setSelectedOrderForDetail(updatedOrder);
    }
  };

  const handleQuickChangeStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: newStatus,
      title: `Estado cambiado a: ${newStatus.toUpperCase()}`,
      note: 'Actualización rápida desde la lista de órdenes.',
      user: currentUser ? currentUser.name : 'Técnico de Turno',
      channel: 'sistema' as const
    };

    const updatedOrder: RepairOrder = {
      ...order,
      status: newStatus,
      timeline: [timelineEntry, ...order.timeline],
      ...(newStatus === 'listo' ? { readyDate: new Date().toISOString() } : {}),
      ...(newStatus === 'entregado' ? { deliveredDate: new Date().toISOString() } : {})
    };

    handleSaveOrderChanges(updatedOrder);

    if (newStatus === 'listo') {
      setNotificationTarget({ order: updatedOrder, channel: 'whatsapp' });
    }
  };

  const handleRecordNotification = (
    orderId: string,
    channel: 'whatsapp' | 'email',
    messageSummary: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: order.status,
      title: `Notificación enviada por ${channel === 'whatsapp' ? 'WhatsApp' : 'Correo'}`,
      note: messageSummary,
      user: 'Sistema Notificaciones',
      channel
    };

    const updatedOrder: RepairOrder = {
      ...order,
      timeline: [timelineEntry, ...order.timeline]
    };
    handleSaveOrderChanges(updatedOrder);
  };

  // Inventory Handlers
  const handleAddPart = (newPart: InventoryPart) => {
    const updated = [newPart, ...parts];
    handleUpdateParts(updated);
  };

  const handleUpdatePart = (updatedPart: InventoryPart) => {
    const updated = parts.map((p) => (p.id === updatedPart.id ? updatedPart : p));
    handleUpdateParts(updated);
  };

  const handleDeletePart = (partId: string) => {
    const updated = parts.filter((p) => p.id !== partId);
    handleUpdateParts(updated);
  };

  // Teardown / Scrap Harvest Handler
  const handleSalvageToInventory = (donor: DonorDevice, part: SalvagePart) => {
    const newInventoryPart: InventoryPart = {
      id: `part-rec-${Date.now()}`,
      sku: `REC-${donor.code}-${Date.now().toString().slice(-4)}`,
      name: `${part.name} (Recuperada ${donor.brand} ${donor.model})`,
      category: part.componentType,
      deviceType: donor.deviceType,
      compatibleModels: [`${donor.brand} ${donor.model}`],
      stock: 1,
      minStock: 1,
      costPrice: part.costAssigned || Math.round(donor.purchaseCost / donor.parts.length),
      salePrice: part.suggestedPrice,
      location: `Huesera ${donor.code}`,
      source: 'recuperado_despiece',
      donorDeviceId: donor.id,
      notes: `Extraído de equipo ${donor.brand} ${donor.model} (${donor.code}). Estado: ${part.condition}.`
    };

    const updatedParts = [newInventoryPart, ...parts];
    handleUpdateParts(updatedParts);

    const updatedDonorParts = donor.parts.map((p) =>
      p.id === part.id
        ? {
            ...p,
            extracted: true,
            extractedDate: new Date().toISOString().slice(0, 10),
            inventoryPartId: newInventoryPart.id
          }
        : p
    );

    const allExtracted = updatedDonorParts.every((p) => p.extracted || p.condition === 'dañado');

    const updatedDonor: DonorDevice = {
      ...donor,
      parts: updatedDonorParts,
      status: allExtracted ? 'despiezado_completo' : 'en_proceso'
    };

    const updatedDonors = donors.map((d) => (d.id === donor.id ? updatedDonor : d));
    handleUpdateDonors(updatedDonors);

    alert(`¡Repuesto "${newInventoryPart.name}" extraído e ingresado exitosamente al inventario general!`);
  };

  const handleAddDonor = (newDonor: DonorDevice) => {
    const updated = [newDonor, ...donors];
    handleUpdateDonors(updated);
  };

  const handleUpdateDonor = (updatedDonor: DonorDevice) => {
    const updated = donors.map((d) => (d.id === updatedDonor.id ? updatedDonor : d));
    handleUpdateDonors(updated);
  };

  const handleViewAsClient = (orderNumber: string) => {
    setPortalOrderQuery(orderNumber);
    setCurrentTab('client_portal');
    if (selectedOrderForDetail) {
      setSelectedOrderForDetail(null);
    }
  };

  // Compute counts
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'entregado' && o.status !== 'cancelado'
  ).length;
  const lowStockCount = parts.filter((p) => p.stock <= p.minStock).length;
  const lastOrderNumber = orders[0]?.orderNumber || 'ORD-1045';
  const shellMode = resolveShellMode({
    hasAccount: Boolean(currentUser),
    demoActive,
    hasPortalQuery: Boolean(portalOrderQuery),
  });
  const section = visibleSection(shellMode, currentTab);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500 flex items-center justify-center text-sm">
        Cargando sesión...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        mode={shellMode}
        currentTab={section === 'portal' ? 'client_portal' : section === 'landing' ? 'landing' : section}
        onSelectTab={setCurrentTab}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onEnterDemo={() => enterDemo('orders')}
        onExitDemo={exitDemo}
        onGoHome={goHome}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        activeOrdersCount={activeOrdersCount}
        lowStockCount={lowStockCount}
        workshopName={settings.workshopName}
        logoDataUrl={settings.logoDataUrl}
        isPlatformOwner={currentUser?.role === 'admin'}
      />

      {/* PERMISSIONS & DATA PERSISTENCE STATUS STRIP */}
      {(shellMode === 'demo' || shellMode === 'account') && (
        <div
          className={`text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b transition-colors ${
            currentUser && currentUser.hasPersistence
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-amber-500 text-slate-950 font-medium border-amber-600'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {currentUser && currentUser.hasPersistence ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>
                    <strong>{currentUser.role === 'admin' ? 'Cuenta principal' : 'Taller'}:</strong>{' '}
                    <strong>{currentUser.name}</strong> ({currentUser.username}). Solo ves los datos de esta cuenta.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>
                    <strong>Modo Prueba Demo (Sin persistencia):</strong> Los cambios solo duran esta sesión y no se guardan permanentemente.
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!currentUser || !currentUser.hasPersistence ? (
                <>
                  <button
                    onClick={handleResetDemoData}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-950 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer Demo</span>
                  </button>

                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-2.5 py-1 bg-white text-slate-950 font-bold rounded text-[11px] hover:bg-amber-50 transition-colors shadow-xs"
                  >
                    Ingresar
                  </button>

                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-2.5 py-1 bg-slate-950 text-white font-bold rounded text-[11px] hover:bg-slate-900 transition-colors shadow-xs"
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-100">
                    Taller: <strong>{settings.workshopName || currentUser.workshopName}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {section === 'landing' && (
          <LandingPage
            onStartTrial={() => setIsTrialModalOpen(true)}
            onOpenCheckout={() => setIsCheckoutModalOpen(true)}
            onEnterApp={(tab) => enterDemo(tab || 'orders')}
            onOpenAuthModal={handleOpenAuth}
            trial={trial}
            settings={settings}
            currentUser={currentUser}
          />
        )}

        {section === 'portal' && shellMode === 'portal' && (
          <CustomerPortalView
            orders={orders}
            settings={settings}
            initialOrderNumber={portalOrderQuery}
            onUpdateOrder={handleSaveOrderChanges}
            onBackToAdmin={goHome}
            backLabel="Volver al inicio"
          />
        )}

        {section === 'orders' && (
          <OrdersList
            orders={orders}
            settings={settings}
            onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
            onOpenNewOrder={() => setIsNewOrderOpen(true)}
            onOpenNotification={(ord, channel) =>
              setNotificationTarget({ order: ord, channel })
            }
            onOpenPrintTicket={(ord) => setPrintTicketOrder(ord)}
            onViewAsClient={handleViewAsClient}
            onQuickChangeStatus={handleQuickChangeStatus}
          />
        )}

        {section === 'inventory' && (
          <InventoryManager
            parts={parts}
            settings={settings}
            onAddPart={handleAddPart}
            onUpdatePart={handleUpdatePart}
            onDeletePart={handleDeletePart}
          />
        )}

        {section === 'teardown' && (
          <TeardownManager
            donors={donors}
            settings={settings}
            onAddDonor={handleAddDonor}
            onUpdateDonor={handleUpdateDonor}
            onSalvageToInventory={handleSalvageToInventory}
          />
        )}

        {section === 'history' && (
          <RepairHistory
            orders={orders}
            settings={settings}
            onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
          />
        )}

        {section === 'client_portal' && (
          <CustomerPortalView
            orders={orders}
            settings={settings}
            initialOrderNumber={portalOrderQuery}
            onUpdateOrder={handleSaveOrderChanges}
            onBackToAdmin={() => setCurrentTab('orders')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                FixiTsch
              </span>
              <span>·</span>
              <span>Software para Servicios Técnicos de Tecnología</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Datos aislados por cuenta
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              {shellMode === 'public' || shellMode === 'portal' ? (
                <>
                  <button
                    onClick={goHome}
                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  >
                    Ingresar
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('orders')}
                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  >
                    Órdenes
                  </button>
                  <button
                    onClick={() => setCurrentTab('client_portal')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Portal Clientes
                  </button>
                  {shellMode === 'account' ? (
                    <button onClick={handleLogout} className="text-rose-600 hover:underline">
                      Cerrar sesión
                    </button>
                  ) : (
                    <button onClick={exitDemo} className="text-rose-600 hover:underline">
                      Salir de la demo
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              Desarrollado por <strong>Nico Schiavon</strong> · Contacto:{' '}
              <a href="mailto:nico.schiavon@gmail.com" className="hover:underline text-indigo-500">
                nico.schiavon@gmail.com
              </a>
            </div>
            <div>
              © {new Date().getFullYear()} FixiTsch. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onSave={handleCreateOrder}
        lastOrderNumber={lastOrderNumber}
      />

      {/* 2. Order Detail & Workflow Modal */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          inventoryParts={parts}
          settings={settings}
          isOpen={true}
          onClose={() => setSelectedOrderForDetail(null)}
          onUpdateOrder={handleSaveOrderChanges}
          onOpenNotification={(ord, ch) =>
            setNotificationTarget({ order: ord, channel: ch })
          }
          onOpenPrintTicket={(ord) => setPrintTicketOrder(ord)}
          onViewAsClient={handleViewAsClient}
        />
      )}

      {/* 3. Notification Modal (WhatsApp / Email) */}
      {notificationTarget && (
        <NotificationModal
          order={notificationTarget.order}
          settings={settings}
          isOpen={true}
          defaultChannel={notificationTarget.channel}
          onClose={() => setNotificationTarget(null)}
          onRecordNotification={handleRecordNotification}
        />
      )}

      {/* 4. Printable Ticket Modal */}
      {printTicketOrder && (
        <PrintTicketModal
          order={printTicketOrder}
          settings={settings}
          isOpen={true}
          onClose={() => setPrintTicketOrder(null)}
        />
      )}

      {/* 5. Workshop Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
        onReloadAllData={handleReloadAll}
        persisted={Boolean(currentUser)}
        onClearData={handleClearAccount}
        onExportData={() => exportCurrentData(currentUser, orders, parts, donors, settings)}
      />

      {/* 6. Trial Account Modal */}
      <TrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onActivateTrial={handleActivateTrial}
        currentSettings={settings}
      />

      {/* 7. Plan Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
        trial={trial}
        settings={settings}
      />

      {/* 8. Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}

function exportCurrentData(
  user: UserAccount | null,
  orders: RepairOrder[],
  parts: InventoryPart[],
  donors: DonorDevice[],
  settings: WorkshopSettings
) {
  const data = {
    user: user ? { username: user.username, workshopName: user.workshopName } : { role: 'guest_demo' },
    orders,
    parts,
    donors,
    settings,
    exportedAt: new Date().toISOString(),
    version: '2.1-FixiTsch'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_fixitsch_${user?.username || 'demo'}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
