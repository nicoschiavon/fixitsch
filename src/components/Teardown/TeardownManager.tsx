import React, { useState } from 'react';
import {
  Wrench,
  Package,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Tablet,
  Laptop,
  ArrowRight,
  TrendingUp,
  Tag,
  DollarSign,
  X
} from 'lucide-react';
import { DonorDevice, SalvagePart, InventoryPart, DeviceType, WorkshopSettings, PartCategory } from '../../types';
import { formatCurrency, formatDate, DEVICE_LABELS } from '../../utils/helpers';

interface TeardownManagerProps {
  donors: DonorDevice[];
  settings: WorkshopSettings;
  onUpdateDonor: (donor: DonorDevice) => void;
  onAddDonor: (donor: DonorDevice) => void;
  onSalvageToInventory: (donor: DonorDevice, part: SalvagePart) => void;
}

export const TeardownManager: React.FC<TeardownManagerProps> = ({
  donors,
  settings,
  onUpdateDonor,
  onAddDonor,
  onSalvageToInventory
}) => {
  const [selectedDonorId, setSelectedDonorId] = useState<string>(donors[0]?.id || '');
  const [isNewDonorModalOpen, setIsNewDonorModalOpen] = useState(false);

  // New donor form
  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [origin, setOrigin] = useState<'cliente_abandono' | 'compra_lote' | 'donacion' | 'garantia_cambio'>('compra_lote');
  const [purchaseCost, setPurchaseCost] = useState<number>(10000);
  const [diagnosticSummary, setDiagnosticSummary] = useState('');

  const selectedDonor = donors.find((d) => d.id === selectedDonorId) || donors[0];

  // Metrics
  const totalDonors = donors.length;
  let totalExtractedParts = 0;
  let totalPotentialValue = 0;
  let totalAcquisitionCost = 0;

  donors.forEach((d) => {
    totalAcquisitionCost += d.purchaseCost || 0;
    d.parts.forEach((p) => {
      if (p.extracted) {
        totalExtractedParts += 1;
      }
      if (p.condition !== 'dañado') {
        totalPotentialValue += p.suggestedPrice || 0;
      }
    });
  });

  const handleOpenNewDonor = () => {
    setDeviceType('smartphone');
    setBrand('');
    setModel('');
    setColor('');
    setSerialOrImei('');
    setOrigin('compra_lote');
    setPurchaseCost(8000);
    setDiagnosticSummary('');
    setIsNewDonorModalOpen(true);
  };

  const handleCreateDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    // Generate standard salvageable components based on device type
    const defaultParts: SalvagePart[] =
      deviceType === 'smartphone'
        ? [
            {
              id: `sp-${Date.now()}-1`,
              name: `Módulo Display / Pantalla ${brand} ${model}`,
              componentType: 'pantalla',
              condition: 'excelente',
              extracted: false,
              suggestedPrice: 35000,
              costAssigned: 5000,
              notes: 'Verificar touch antes de instalar'
            },
            {
              id: `sp-${Date.now()}-2`,
              name: `Batería Original ${brand} ${model}`,
              componentType: 'bateria',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 18000,
              costAssigned: 2000,
              notes: 'Testear salud en analizador'
            },
            {
              id: `sp-${Date.now()}-3`,
              name: `Módulo de Cámaras Traseras`,
              componentType: 'camara',
              condition: 'excelente',
              extracted: false,
              suggestedPrice: 22000,
              costAssigned: 3000
            },
            {
              id: `sp-${Date.now()}-4`,
              name: `Placa / Flex Pin de Carga USB`,
              componentType: 'pin_carga',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 12000,
              costAssigned: 1500
            },
            {
              id: `sp-${Date.now()}-5`,
              name: `Altavoz Parlante + Auricular`,
              componentType: 'otros',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 8000,
              costAssigned: 1000
            }
          ]
        : deviceType === 'notebook'
        ? [
            {
              id: `sp-${Date.now()}-1`,
              name: `Pantalla LED Slim ${brand} ${model}`,
              componentType: 'pantalla',
              condition: 'excelente',
              extracted: false,
              suggestedPrice: 55000,
              costAssigned: 10000
            },
            {
              id: `sp-${Date.now()}-2`,
              name: `Teclado Español Original`,
              componentType: 'teclado',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 26000,
              costAssigned: 4000
            },
            {
              id: `sp-${Date.now()}-3`,
              name: `Juego de Bisagras I&D`,
              componentType: 'carcasa_bisagra',
              condition: 'excelente',
              extracted: false,
              suggestedPrice: 16000,
              costAssigned: 2500
            },
            {
              id: `sp-${Date.now()}-4`,
              name: `Cooler / Disipador Térmico`,
              componentType: 'otros',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 14000,
              costAssigned: 2000
            },
            {
              id: `sp-${Date.now()}-5`,
              name: `Módulo Wi-Fi M.2`,
              componentType: 'otros',
              condition: 'excelente',
              extracted: false,
              suggestedPrice: 8500,
              costAssigned: 1000
            }
          ]
        : [
            {
              id: `sp-${Date.now()}-1`,
              name: `Display + Vidrio Táctil ${brand} ${model}`,
              componentType: 'pantalla',
              condition: 'excelente',
              extracted: false,
              suggestedPrice: 48000,
              costAssigned: 8000
            },
            {
              id: `sp-${Date.now()}-2`,
              name: `Batería Interna Original`,
              componentType: 'bateria',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 20000,
              costAssigned: 3000
            },
            {
              id: `sp-${Date.now()}-3`,
              name: `Flex de Carga y Datos`,
              componentType: 'pin_carga',
              condition: 'bueno',
              extracted: false,
              suggestedPrice: 11000,
              costAssigned: 1500
            }
          ];

    const newDonor: DonorDevice = {
      id: `donor-${Date.now()}`,
      code: `DES-0${donors.length + 15}`,
      deviceType,
      brand,
      model,
      color,
      serialOrImei,
      entryDate: new Date().toISOString().slice(0, 10),
      origin,
      purchaseCost: Number(purchaseCost) || 0,
      status: 'disponible_despiece',
      diagnosticSummary: diagnosticSummary || 'Equipo para desarme y recuperación de partes útiles.',
      parts: defaultParts
    };

    onAddDonor(newDonor);
    setSelectedDonorId(newDonor.id);
    setIsNewDonorModalOpen(false);
  };

  const handleExtractPart = (part: SalvagePart) => {
    if (!selectedDonor) return;
    onSalvageToInventory(selectedDonor, part);
  };

  const getConditionBadge = (cond: SalvagePart['condition']) => {
    switch (cond) {
      case 'excelente':
        return <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Excelente (100%)</span>;
      case 'bueno':
        return <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Bueno (80%)</span>;
      case 'regular':
        return <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Regular (60%)</span>;
      default:
        return <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">Dañado / Descartar</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Equipos para Despiece</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalDonors} equipos
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Celulares, tablets y laptops</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Repuestos Recuperados</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {totalExtractedParts} piezas
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">Ingresadas al inventario</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Valor Potencial en Repuestos</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {formatCurrency(totalPotentialValue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Precio venta al cliente</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Costo de Adquisición</div>
          <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
            {formatCurrency(totalAcquisitionCost, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Alto retorno de inversión</div>
        </div>
      </div>

      {/* Main Teardown Bench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: List of donor devices */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Huesera / Equipos Donantes</span>
            </h3>
            <button
              onClick={handleOpenNewDonor}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
            {donors.map((donor) => {
              const isSelected = selectedDonor?.id === donor.id;
              const extractedCount = donor.parts.filter((p) => p.extracted).length;
              const totalPartsCount = donor.parts.length;
              const pct = totalPartsCount > 0 ? Math.round((extractedCount / totalPartsCount) * 100) : 0;

              return (
                <button
                  key={donor.id}
                  onClick={() => setSelectedDonorId(donor.id)}
                  className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-3 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {donor.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(donor.entryDate)}</span>
                  </div>

                  <div className="font-semibold text-slate-900 dark:text-white text-xs mt-1">
                    {donor.brand} {donor.model}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {donor.diagnosticSummary}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Progreso de Despiece</span>
                      <span className="font-mono">{extractedCount}/{totalPartsCount} piezas ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Teardown Bench */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          {selectedDonor ? (
            <>
              {/* Donor summary header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {selectedDonor.code}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedDonor.brand} {selectedDonor.model} ({DEVICE_LABELS[selectedDonor.deviceType]})
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedDonor.color} · Serie/IMEI: {selectedDonor.serialOrImei || 'Sin registrar'} · Ingreso: {formatDate(selectedDonor.entryDate)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-500">Costo Adquisición</div>
                    <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      {formatCurrency(selectedDonor.purchaseCost, settings.currencySymbol)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Motivo del desguace:</span>{' '}
                  {selectedDonor.diagnosticSummary}
                </div>
              </div>

              {/* Components salvage bench */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Componentes Salvables & Repuestos Disponibles
                  </h3>
                  <span className="text-xs text-slate-500">
                    Haga clic en "Extraer" para incorporarlo automáticamente al inventario general.
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedDonor.parts.map((part) => (
                    <div
                      key={part.id}
                      className={`p-3.5 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        part.extracted
                          ? 'bg-slate-50/60 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 opacity-80'
                          : part.condition === 'dañado'
                          ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {part.name}
                          </span>
                          {getConditionBadge(part.condition)}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>
                            Precio Sugerido: <strong className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(part.suggestedPrice, settings.currencySymbol)}</strong>
                          </span>
                          <span>
                            Costo Asignado: <strong className="font-mono">{formatCurrency(part.costAssigned, settings.currencySymbol)}</strong>
                          </span>
                        </div>

                        {part.notes && (
                          <p className="text-[10px] text-slate-400 italic">
                            Nota: {part.notes}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {part.extracted ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>En Inventario</span>
                          </div>
                        ) : part.condition === 'dañado' ? (
                          <span className="text-[11px] text-slate-400 italic">Descartado</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExtractPart(part)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer transition-colors"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Extraer al Inventario</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              No hay equipos seleccionados en la huesera.
            </div>
          )}
        </div>
      </div>

      {/* New Donor Modal */}
      {isNewDonorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ingresar Equipo a la Huesera para Despiece
              </h3>
              <button
                onClick={() => setIsNewDonorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDonor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Tipo de Dispositivo</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                >
                  <option value="smartphone">Celular / Smartphone</option>
                  <option value="tablet">Tablet / iPad</option>
                  <option value="notebook">Notebook / Laptop</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Apple, Samsung, Dell..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: iPhone 11, Latitude 5490..."
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Color / Acabado</label>
                  <input
                    type="text"
                    placeholder="Ej: Negro, Blanco..."
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Costo de Adquisición ($)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Origen del Dispositivo</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                >
                  <option value="compra_lote">Compra por lote / chatarra</option>
                  <option value="cliente_abandono">Abandono por cliente (&gt;90 días)</option>
                  <option value="donacion">Donación / Plan canje</option>
                  <option value="garantia_cambio">Garantía / Cambio de unidad</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Motivo de Desguace / Diagnóstico Físico
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: Placa madre quemada sin reparación, pero display y cámaras intactos..."
                  value={diagnosticSummary}
                  onChange={(e) => setDiagnosticSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDonorModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs cursor-pointer"
                >
                  Registrar e Iniciar Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
