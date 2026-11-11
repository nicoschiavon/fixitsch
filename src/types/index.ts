export type DeviceType = 'smartphone' | 'tablet' | 'notebook' | 'otro';

export type OrderStatus =
  | 'ingresado'
  | 'diagnostico'
  | 'presupuestado'
  | 'aprobado'
  | 'esperando_repuesto'
  | 'en_reparacion'
  | 'control_calidad'
  | 'listo'
  | 'entregado'
  | 'cancelado';

export type Priority = 'normal' | 'alta' | 'urgente';

export interface PartUsage {
  id: string;
  partId?: string;
  partName: string;
  category: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  source: 'nuevo' | 'recuperado';
  donorDeviceId?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  status: OrderStatus;
  title: string;
  note: string;
  user: string;
  channel?: 'whatsapp' | 'email' | 'sistema' | 'cliente';
}

export interface InspectionChecklist {
  encendido: boolean;
  pantallaTactil: boolean;
  camaras: boolean;
  carga: boolean;
  audioMicrofono: boolean;
  wifiBluetooth: boolean;
  botonesBiometria: boolean;
  senalesRed: boolean;
}

export interface RepairOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-1042"
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientDocument?: string; // DNI / RUT / CI
  
  deviceType: DeviceType;
  brand: string;
  model: string;
  color: string;
  serialOrImei: string;
  passcode: string; // PIN o patrón descriptivo
  
  physicalCondition: string; // Ej: "Rayones leves en tapa, pantalla astillada ángulo sup. der."
  accessoriesIncluded: string; // Ej: "Funda de silicona, sin cargador"
  reportedIssue: string; // Ej: "No enciende tras golpe, vibraba antes"
  initialDiagnosis: string;
  technicianNotes: string;
  assignedTechnician: string;
  
  priority: Priority;
  status: OrderStatus;
  
  createdAt: string;
  estimatedDate: string;
  readyDate?: string;
  deliveredDate?: string;
  
  laborCost: number;
  partsUsed: PartUsage[];
  discount: number;
  depositPaid: number; // Abono o seña inicial
  
  checklist: InspectionChecklist;
  budgetStatus: 'sin_presupuesto' | 'pendiente_aprobacion' | 'aprobado' | 'rechazado';
  
  timeline: TimelineEntry[];
  warrantyDays: number;
}

export type PartCategory =
  | 'pantalla'
  | 'bateria'
  | 'pin_carga'
  | 'teclado'
  | 'camara'
  | 'placa_motherboard'
  | 'flex_cable'
  | 'disco_ram'
  | 'carcasa_bisagra'
  | 'otros';

export interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  category: PartCategory;
  compatibleModels: string[];
  deviceType: DeviceType;
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  location: string; // ej: "Gaveta B-04", "Estante 2"
  source: 'nuevo' | 'recuperado_despiece';
  donorDeviceId?: string;
  notes?: string;
}

export interface SalvagePart {
  id: string;
  name: string;
  componentType: PartCategory;
  condition: 'excelente' | 'bueno' | 'regular' | 'dañado';
  extracted: boolean;
  extractedDate?: string;
  inventoryPartId?: string;
  suggestedPrice: number;
  costAssigned: number;
  notes?: string;
}

export interface DonorDevice {
  id: string;
  code: string; // ej: "DES-021"
  deviceType: DeviceType;
  brand: string;
  model: string;
  color: string;
  serialOrImei: string;
  entryDate: string;
  origin: 'cliente_abandono' | 'compra_lote' | 'donacion' | 'garantia_cambio';
  purchaseCost: number;
  status: 'disponible_despiece' | 'en_proceso' | 'despiezado_completo';
  diagnosticSummary: string; // Por qué se desguaza: "Placa quemada por agua de mar, chasis y pantalla sanos"
  parts: SalvagePart[];
}

export interface WorkshopSettings {
  workshopName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  taxId: string; // CUIT / RUT / RFC
  defaultWarrantyDays: number;
  currencySymbol: string;
  termsConditions: string;
  whatsappReadyTemplate: string;
  whatsappBudgetTemplate: string;
}

export interface TrialAccount {
  active: boolean;
  workshopName: string;
  ownerName: string;
  email: string;
  whatsapp: string;
  techniciansCount: number;
  devices: string[];
  startedAt: string;
  expiresAt: string;
  isSubscribed: boolean;
  subscriptionPlan?: 'mensual_30k' | 'anual_300k';
  subscriptionDate?: string;
  paymentMethod?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  features: string[];
  status: 'Producción' | 'Beta Activa' | 'Open Source';
  url?: string;
  githubUrl?: string;
}

export type UserRole = 'guest_demo' | 'registered_full_access' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  role: UserRole;
  workshopName: string;
  createdAt: string;
  hasPersistence: boolean;
  planStatus: 'demo_trial' | 'full_access_free_promo';
}
