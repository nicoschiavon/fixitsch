import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  X,
  Layers,
  ArrowUpDown,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react';
import { InventoryPart, PartCategory, DeviceType, WorkshopSettings } from '../../types';
import { formatCurrency, DEVICE_LABELS } from '../../utils/helpers';

interface InventoryManagerProps {
  parts: InventoryPart[];
  settings: WorkshopSettings;
  onAddPart: (part: InventoryPart) => void;
  onUpdatePart: (part: InventoryPart) => void;
  onDeletePart: (partId: string) => void;
}

const CATEGORY_LABELS: Record<PartCategory, string> = {
  pantalla: 'Pantallas / Displays',
  bateria: 'Baterías',
  pin_carga: 'Pines / Placas de Carga',
  teclado: 'Teclados',
  camara: 'Cámaras',
  placa_motherboard: 'Placas Madre / Lógicas',
  flex_cable: 'Cables Flex / Conectores',
  disco_ram: 'Discos SSD & Memorias RAM',
  carcasa_bisagra: 'Carcasas, Chasis & Bisagras',
  otros: 'Otros / Disipadores / Audio'
};

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  parts,
  settings,
  onAddPart,
  onUpdatePart,
  onDeletePart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal for new/edit part
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryPart | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<PartCategory>('pantalla');
  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone');
  const [compatibleModelsStr, setCompatibleModelsStr] = useState('');
  const [stock, setStock] = useState<number>(1);
  const [minStock, setMinStock] = useState<number>(2);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'nuevo' | 'recuperado_despiece'>('nuevo');

  const filteredParts = parts.filter((part) => {
    const matchSearch =
      searchTerm === '' ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.compatibleModels.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchDevice = deviceFilter === 'all' || part.deviceType === deviceFilter;
    const matchLowStock = showLowStockOnly ? part.stock <= part.minStock : true;

    return matchSearch && matchCategory && matchDevice && matchLowStock;
  });

  const lowStockCount = parts.filter((p) => p.stock <= p.minStock).length;
  const totalStockUnits = parts.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = parts.reduce((acc, p) => acc + p.costPrice * p.stock, 0);

  const handleOpenNew = () => {
    setEditingPart(null);
    setName('');
    setSku(`REP-${Date.now().toString().slice(-5)}`);
    setCategory('pantalla');
    setDeviceType('smartphone');
    setCompatibleModelsStr('');
    setStock(2);
    setMinStock(2);
    setCostPrice(10000);
    setSalePrice(22000);
    setLocation('Gaveta A-01');
    setNotes('');
    setSource('nuevo');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (part: InventoryPart) => {
    setEditingPart(part);
    setName(part.name);
    setSku(part.sku);
    setCategory(part.category);
    setDeviceType(part.deviceType);
    setCompatibleModelsStr(part.compatibleModels.join(', '));
    setStock(part.stock);
    setMinStock(part.minStock);
    setCostPrice(part.costPrice);
    setSalePrice(part.salePrice);
    setLocation(part.location);
    setNotes(part.notes || '');
    setSource(part.source);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    const compatList = compatibleModelsStr
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    if (editingPart) {
      onUpdatePart({
        ...editingPart,
        name,
        sku,
        category,
        deviceType,
        compatibleModels: compatList,
        stock: Number(stock),
        minStock: Number(minStock),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        location,
        notes,
        source
      });
    } else {
      const newPart: InventoryPart = {
        id: `part-${Date.now()}`,
        name,
        sku,
        category,
        deviceType,
        compatibleModels: compatList,
        stock: Number(stock),
        minStock: Number(minStock),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        location,
        notes,
        source
      };
      onAddPart(newPart);
    }
    setIsModalOpen(false);
  };

  const handleAdjustStock = (part: InventoryPart, delta: number) => {
    const newStock = Math.max(0, part.stock + delta);
    onUpdatePart({
      ...part,
      stock: newStock
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Total Ítems en Catálogo</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {parts.length} ítems
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{totalStockUnits} unidades en depósito</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 font-medium">Valor de Repuestos (Costo)</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {formatCurrency(totalInventoryValue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Capital en stock disponible</div>
        </div>

        <div
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            lowStockCount > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="text-xs text-amber-800 dark:text-amber-400 font-medium flex items-center justify-between">
            <span>Alertas de Stock Bajo</span>
            {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-600" />}
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-1 tabular-nums">
            {lowStockCount} piezas
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            {showLowStockOnly ? 'Haga clic para ver todos' : 'Haga clic para filtrar bajo stock'}
          </div>
        </div>
      </div>

      {/* Filter and Action bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por repuesto, SKU, modelo compatible (ej: iPhone 14, S22, T490) o gaveta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">Todas las Categorías</option>
              {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                <option key={catKey} value={catKey}>
                  {catLabel}
                </option>
              ))}
            </select>

            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">Todos los Tipos</option>
              <option value="smartphone">Celulares</option>
              <option value="tablet">Tablets</option>
              <option value="notebook">Notebooks</option>
            </select>

            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Repuesto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU / Repuesto</th>
                <th className="py-3 px-4 font-semibold">Categoría & Compatibilidad</th>
                <th className="py-3 px-4 font-semibold">Origen</th>
                <th className="py-3 px-4 font-semibold">Ubicación</th>
                <th className="py-3 px-4 font-semibold text-center">Stock</th>
                <th className="py-3 px-4 font-semibold text-right">Costo</th>
                <th className="py-3 px-4 font-semibold text-right">Precio Venta</th>
                <th className="py-3 px-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No hay repuestos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.stock <= part.minStock;
                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {part.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {part.sku}
                        </div>
                      </td>

                      {/* Category & Compat */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {CATEGORY_LABELS[part.category] || part.category}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {part.compatibleModels.join(', ')}
                        </div>
                      </td>

                      {/* Origin / Source */}
                      <td className="py-3 px-4">
                        {part.source === 'recuperado_despiece' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                            <span>♻️ Despiece Recuperado</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Nuevo / Proveedor
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{part.location || 'Sin asignar'}</span>
                        </div>
                      </td>

                      {/* Stock controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(part, -1)}
                            className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold text-sm min-w-6 text-center tabular-nums ${
                              isLow
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {part.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(part, 1)}
                            className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <div className="text-[9px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                            Mín: {part.minStock}
                          </div>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        {formatCurrency(part.costPrice, settings.currencySymbol)}
                      </td>

                      {/* Sale price */}
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(part.salePrice, settings.currencySymbol)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(part)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Editar pieza"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar repuesto "${part.name}"?`)) {
                                onDeletePart(part.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950"
                            title="Eliminar pieza"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / New Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPart ? 'Editar Repuesto' : 'Nuevo Repuesto para Inventario'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Nombre del Repuesto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Batería iPhone 13 Original"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    SKU / Código Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PartCategory)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Dispositivo
                  </label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  >
                    <option value="smartphone">Celular</option>
                    <option value="tablet">Tablet</option>
                    <option value="notebook">Notebook</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Origen
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as 'nuevo' | 'recuperado_despiece')}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                  >
                    <option value="nuevo">Nuevo / Fábrica</option>
                    <option value="recuperado_despiece">Recuperado Despiece</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Modelos Compatibles (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: iPhone 13, iPhone 14, iPhone 13 Pro"
                  value={compatibleModelsStr}
                  onChange={(e) => setCompatibleModelsStr(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Costo Compra ($)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-mono font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Ubicación Física en Taller (Estante / Gaveta / Caja)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Gaveta B-04, Estante Notebooks 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Notas / Observaciones Técnicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Calidad, revisión de flex, precauciones de montaje..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs cursor-pointer"
                >
                  {editingPart ? 'Actualizar Repuesto' : 'Guardar en Inventario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
