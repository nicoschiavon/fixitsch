import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  Laptop,
  HelpCircle,
  Plus,
  Calendar,
  User,
  Shield,
  Coins
} from 'lucide-react';
import { RepairOrder, DeviceType, Priority } from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newOrder: RepairOrder) => void;
  lastOrderNumber: string;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lastOrderNumber
}) => {
  if (!isOpen) return null;

  // Compute next order number e.g. ORD-1046
  const nextNumberNum = parseInt(lastOrderNumber.replace(/\D/g, ''), 10) + 1 || 1046;
  const nextOrderNumber = `ORD-${nextNumberNum}`;

  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [passcode, setPasscode] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientDocument, setClientDocument] = useState('');

  const [reportedIssue, setReportedIssue] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('Carlos Benítez');
  const [priority, setPriority] = useState<Priority>('normal');

  const [laborCost, setLaborCost] = useState<number>(18000);
  const [depositPaid, setDepositPaid] = useState<number>(0);

  // Suggested brands based on device type
  const brandSuggestions =
    deviceType === 'smartphone'
      ? ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Google Pixel']
      : deviceType === 'tablet'
      ? ['Apple', 'Samsung', 'Lenovo', 'Amazon Kindle', 'Huawei']
      : ['Apple', 'Lenovo', 'Dell', 'HP', 'ASUS', 'Acer'];

  const handleAddConditionChip = (text: string) => {
    setPhysicalCondition((prev) => (prev ? `${prev}, ${text}` : text));
  };

  const handleAddAccessoryChip = (text: string) => {
    setAccessoriesIncluded((prev) => (prev ? `${prev}, ${text}` : text));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !clientPhone || !brand || !model || !reportedIssue) {
      alert('Por favor complete los campos obligatorios: Cliente, Teléfono, Marca, Modelo y Falla reportada.');
      return;
    }

    const estimated = new Date();
    estimated.setDate(estimated.getDate() + 2);

    const newOrder: RepairOrder = {
      id: `order-${Date.now()}`,
      orderNumber: nextOrderNumber,
      clientName,
      clientPhone,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '')}@ejemplo.com`,
      clientDocument,
      deviceType,
      brand,
      model,
      color,
      serialOrImei,
      passcode,
      physicalCondition: physicalCondition || 'Sin daños visibles evidentes',
      accessoriesIncluded: accessoriesIncluded || 'Sin accesorios',
      reportedIssue,
      initialDiagnosis: 'En espera de revisión preliminar en mesa de trabajo',
      technicianNotes: '',
      assignedTechnician,
      priority,
      status: 'ingresado',
      createdAt: new Date().toISOString(),
      estimatedDate: estimated.toISOString(),
      laborCost: Number(laborCost) || 0,
      partsUsed: [],
      discount: 0,
      depositPaid: Number(depositPaid) || 0,
      checklist: {
        encendido: false,
        pantallaTactil: false,
        camaras: false,
        carga: false,
        audioMicrofono: false,
        wifiBluetooth: false,
        botonesBiometria: false,
        senalesRed: false
      },
      budgetStatus: 'sin_presupuesto',
      warrantyDays: 90,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'ingresado',
          title: 'Ingreso al Taller',
          note: `Equipo recibido en recepción. Seña inicial: $${depositPaid}. Falla: ${reportedIssue}`,
          user: 'Recepcionista',
          channel: 'sistema'
        }
      ]
    };

    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nueva Orden de Servicio Técnico
              </h3>
              <p className="text-xs text-slate-500 font-mono">Asignada: {nextOrderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Device Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">
              Tipo de Dispositivo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'smartphone' as DeviceType, label: 'Celular', icon: Smartphone },
                { type: 'tablet' as DeviceType, label: 'Tablet', icon: Tablet },
                { type: 'notebook' as DeviceType, label: 'Notebook', icon: Laptop },
                { type: 'otro' as DeviceType, label: 'Otro Dispositivo', icon: HelpCircle }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = deviceType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setDeviceType(item.type)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Customer Information */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Datos del Cliente</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">WhatsApp / Teléfono *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 5491133445566"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="laura@ejemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">DNI / Documento Identidad</label>
                <input
                  type="text"
                  placeholder="Ej: 32.456.789"
                  value={clientDocument}
                  onChange={(e) => setClientDocument(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Device Details */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              Detalles del Dispositivo
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Apple, Samsung, Lenovo..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandSuggestions.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrand(b)}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Modelo Exacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Galaxy S23, iPhone 14, ThinkPad T480"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Color</label>
                <input
                  type="text"
                  placeholder="Ej: Azul Oscuro, Plata, Negro"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Número de Serie / IMEI</label>
                <input
                  type="text"
                  placeholder="Ej: 358921098451239"
                  value={serialOrImei}
                  onChange={(e) => setSerialOrImei(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Contraseña / PIN o Patrón</label>
                <input
                  type="text"
                  placeholder="Ej: 1234, o 'L' de inicio sup-izq"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Reported issue & condition */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Falla Reportada por el Cliente *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describa el síntoma: no enciende, se cayó al agua, no da imagen, batería inflada, se calienta..."
                value={reportedIssue}
                onChange={(e) => setReportedIssue(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Estado Físico del Equipo al Recibir
              </label>
              <input
                type="text"
                placeholder="Rayones, golpes, abolladuras..."
                value={physicalCondition}
                onChange={(e) => setPhysicalCondition(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {[
                  'Rayones en pantalla',
                  'Vidrio quebrado',
                  'Golpe en esquinas',
                  'Tapa trasera rota',
                  'Rastros de humedad',
                  'Impecable estado'
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleAddConditionChip(c)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Accesorios Dejados
              </label>
              <input
                type="text"
                placeholder="Funda, cargador, cable..."
                value={accessoriesIncluded}
                onChange={(e) => setAccessoriesIncluded(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Sin accesorios', 'Con funda/case', 'Con cargador original', 'Con bandeja SIM'].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAddAccessoryChip(a)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  >
                    + {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assignment and costs */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium mb-1">Técnico Asignado</label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
              >
                <option value="Carlos Benítez">Carlos Benítez (Smartphones/Tablets)</option>
                <option value="Gonzalo Silva">Gonzalo Silva (Notebooks/Microelectrónica)</option>
                <option value="Mariano Acosta">Mariano Acosta (Software/Despiece)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
              >
                <option value="normal">Normal (48-72 hs)</option>
                <option value="alta">Alta (24-48 hs)</option>
                <option value="urgente">Urgente Express (Mismo día)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Mano de Obra Estimada ($)</label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Seña / Abono Inicial ($)</label>
              <input
                type="number"
                value={depositPaid}
                onChange={(e) => setDepositPaid(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono font-semibold text-emerald-700 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
            >
              Crear Orden de Ingreso ({nextOrderNumber})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
