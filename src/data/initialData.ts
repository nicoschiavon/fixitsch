import { RepairOrder, InventoryPart, DonorDevice, WorkshopSettings } from '../types';

export const INITIAL_SETTINGS: WorkshopSettings = {
  workshopName: 'FixiTsch',
  tagline: 'Sistema & Laboratorio Especializado en Celulares, Tablets y Notebooks',
  phone: '+54 11 4567-8900',
  whatsapp: '5491145678900',
  email: 'contacto@fixitsch.com',
  address: 'Av. Corrientes 3420, Piso 1, CABA',
  city: 'Buenos Aires',
  taxId: 'CUIT: 30-71649201-8',
  defaultWarrantyDays: 90,
  currencySymbol: '$',
  termsConditions: 'Los equipos no retirados pasados los 90 días corridos de notificada su finalización serán considerados abandonados. La garantía cubre únicamente la mano de obra y el repuesto reemplazado, no golpes ni daños por líquidos posteriores.',
  whatsappReadyTemplate: '¡Hola {cliente}! Le informamos desde {taller} que su {dispositivo} (Orden #{orden}) ya se encuentra LISTO para retirar en nuestro laboratorio. Saldo a abonar: {saldo}. Puede consultar el detalle en: {link}',
  whatsappBudgetTemplate: '¡Hola {cliente}! Le enviamos el presupuesto para la reparación de su {dispositivo} (Orden #{orden}) por un total de {total}. Por favor revise y apruebe en: {link}'
};

export const INITIAL_PARTS: InventoryPart[] = [
  {
    id: 'part-001',
    sku: 'DISP-IP14-OLED',
    name: 'Pantalla OLED Premium iPhone 14',
    category: 'pantalla',
    deviceType: 'smartphone',
    compatibleModels: ['iPhone 14', 'iPhone 13'],
    stock: 5,
    minStock: 2,
    costPrice: 42000,
    salePrice: 78000,
    location: 'Gaveta A-12',
    source: 'nuevo',
    notes: 'Calidad Incell / OLED Premium con TrueTone reprogramable'
  },
  {
    id: 'part-002',
    sku: 'BAT-IP13-ORIG',
    name: 'Batería Original 3227mAh iPhone 13',
    category: 'bateria',
    deviceType: 'smartphone',
    compatibleModels: ['iPhone 13'],
    stock: 8,
    minStock: 3,
    costPrice: 15000,
    salePrice: 32000,
    location: 'Gaveta A-14',
    source: 'nuevo',
    notes: 'Cero ciclos con flex compatible'
  },
  {
    id: 'part-003',
    sku: 'PIN-SM-S22-USBC',
    name: 'Módulo Placa Pin de Carga Samsung S22',
    category: 'pin_carga',
    deviceType: 'smartphone',
    compatibleModels: ['Samsung Galaxy S22', 'S22 5G'],
    stock: 3,
    minStock: 2,
    costPrice: 8500,
    salePrice: 19500,
    location: 'Gaveta B-02',
    source: 'nuevo',
    notes: 'Con soporte para carga rápida 25W'
  },
  {
    id: 'part-004',
    sku: 'DISP-PAD-AIR5',
    name: 'Módulo Display + Táctil iPad Air 5 (10.9")',
    category: 'pantalla',
    deviceType: 'tablet',
    compatibleModels: ['iPad Air 5 2022', 'iPad Air 4 2020'],
    stock: 2,
    minStock: 1,
    costPrice: 58000,
    salePrice: 110000,
    location: 'Estante C-01',
    source: 'nuevo',
    notes: 'Laminado completo Liquid Retina'
  },
  {
    id: 'part-005',
    sku: 'TEC-MAC-M1-AIR',
    name: 'Teclado MacBook Air M1 A2337 Español',
    category: 'teclado',
    deviceType: 'notebook',
    compatibleModels: ['MacBook Air M1 A2337 2020'],
    stock: 2,
    minStock: 1,
    costPrice: 28000,
    salePrice: 56000,
    location: 'Estante N-04',
    source: 'nuevo',
    notes: 'Distribución ISO Español con retroiluminación'
  },
  {
    id: 'part-006',
    sku: 'SSD-NVME-1TB-SAM',
    name: 'Disco SSD NVMe 1TB Samsung 980 M.2',
    category: 'disco_ram',
    deviceType: 'notebook',
    compatibleModels: ['Dell Inspiron', 'Lenovo ThinkPad', 'HP Pavilion', 'Universal M.2'],
    stock: 6,
    minStock: 2,
    costPrice: 39000,
    salePrice: 65000,
    location: 'Gaveta D-08',
    source: 'nuevo',
    notes: 'Lectura hasta 3500 MB/s'
  },
  {
    id: 'part-007',
    sku: 'REC-CAM-IP12-REC',
    name: 'Cámara Trasera Dual iPhone 12 (Recuperada)',
    category: 'camara',
    deviceType: 'smartphone',
    compatibleModels: ['iPhone 12', 'iPhone 12 mini'],
    stock: 1,
    minStock: 1,
    costPrice: 12000,
    salePrice: 38000,
    location: 'Huesera Box 3',
    source: 'recuperado_despiece',
    donorDeviceId: 'donor-001',
    notes: 'Extraída de equipo con placa en corto. Lente y estabilizador testeados al 100%'
  },
  {
    id: 'part-008',
    sku: 'REC-PANT-S21-AMOLED',
    name: 'Display Dynamic AMOLED 2X Samsung S21 (Recuperada)',
    category: 'pantalla',
    deviceType: 'smartphone',
    compatibleModels: ['Samsung Galaxy S21 5G'],
    stock: 1,
    minStock: 1,
    costPrice: 18000,
    salePrice: 52000,
    location: 'Huesera Box 1',
    source: 'recuperado_despiece',
    donorDeviceId: 'donor-002',
    notes: 'Vidrio impecable, sin quemaduras en panel ni líneas'
  },
  {
    id: 'part-009',
    sku: 'FAN-LEN-THINKPAD',
    name: 'Cooler Disipador Térmico Lenovo ThinkPad T480/T490',
    category: 'otros',
    deviceType: 'notebook',
    compatibleModels: ['ThinkPad T480', 'ThinkPad T490'],
    stock: 3,
    minStock: 2,
    costPrice: 9500,
    salePrice: 22000,
    location: 'Estante N-02',
    source: 'nuevo',
    notes: 'Incluye pasta térmica Arctic MX-4'
  }
];

export const INITIAL_ORDERS: RepairOrder[] = [
  {
    id: 'order-001',
    orderNumber: 'ORD-1042',
    clientName: 'Martín Palermo',
    clientPhone: '5491133445566',
    clientEmail: 'martin.palermo@gmail.com',
    clientDocument: '34.891.204',
    deviceType: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 14',
    color: 'Midnight Blue',
    serialOrImei: '358921098451239',
    passcode: '198204',
    physicalCondition: 'Golpe fuerte en esquina inferior derecha. Cristal astillado, carcasa con marca leve.',
    accessoriesIncluded: 'Funda Spigen de goma negra (sin cargador)',
    reportedIssue: 'La pantalla no da imagen pero el teléfono vibra y recibe llamadas tras una caída.',
    initialDiagnosis: 'Módulo OLED quebrado internamente. Placa madre y consumo de amperaje en banco normales.',
    technicianNotes: 'Se reemplazó módulo display completo. Se reprogramó TrueTone con lectora QianLi. Táctil y cámaras funcionando perfecto.',
    assignedTechnician: 'Carlos Benítez',
    priority: 'alta',
    status: 'listo',
    createdAt: '2026-11-05T09:30:00.000Z',
    estimatedDate: '2026-11-07T18:00:00.000Z',
    readyDate: '2026-11-07T10:15:00.000Z',
    laborCost: 22000,
    partsUsed: [
      {
        id: 'puse-1',
        partId: 'part-001',
        partName: 'Pantalla OLED Premium iPhone 14',
        category: 'pantalla',
        quantity: 1,
        unitCost: 42000,
        unitPrice: 78000,
        source: 'nuevo'
      }
    ],
    discount: 0,
    depositPaid: 30000,
    checklist: {
      encendido: true,
      pantallaTactil: true,
      camaras: true,
      carga: true,
      audioMicrofono: true,
      wifiBluetooth: true,
      botonesBiometria: true,
      senalesRed: true
    },
    budgetStatus: 'aprobado',
    warrantyDays: 90,
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-11-05T09:30:00.000Z',
        status: 'ingresado',
        title: 'Ingreso al Taller',
        note: 'Equipo recibido en mostrador con seña de $30.000.',
        user: 'Recepcionista Ana',
        channel: 'sistema'
      },
      {
        id: 'tl-2',
        timestamp: '2026-11-05T14:20:00.000Z',
        status: 'diagnostico',
        title: 'Diagnóstico Completado',
        note: 'Se confirma display partido. Placa madre en óptimas condiciones.',
        user: 'Carlos Benítez',
        channel: 'sistema'
      },
      {
        id: 'tl-3',
        timestamp: '2026-11-05T15:00:00.000Z',
        status: 'presupuestado',
        title: 'Presupuesto Enviado',
        note: 'Presupuesto total $100.000 informado al cliente vía WhatsApp.',
        user: 'Carlos Benítez',
        channel: 'whatsapp'
      },
      {
        id: 'tl-4',
        timestamp: '2026-11-05T16:10:00.000Z',
        status: 'aprobado',
        title: 'Presupuesto Aprobado',
        note: 'El cliente aprobó la reparación desde el portal.',
        user: 'Martín Palermo',
        channel: 'cliente'
      },
      {
        id: 'tl-5',
        timestamp: '2026-11-06T11:45:00.000Z',
        status: 'en_reparacion',
        title: 'En Reparación',
        note: 'Instalación de nueva pantalla OLED y reprogramación de sensores.',
        user: 'Carlos Benítez',
        channel: 'sistema'
      },
      {
        id: 'tl-6',
        timestamp: '2026-11-07T09:00:00.000Z',
        status: 'control_calidad',
        title: 'Control de Calidad Aprobado',
        note: 'Pruebas de brillo automático, FaceID, TrueTone y altavoces 100% OK.',
        user: 'Carlos Benítez',
        channel: 'sistema'
      },
      {
        id: 'tl-7',
        timestamp: '2026-11-07T10:15:00.000Z',
        status: 'listo',
        title: '¡Equipo Listo para Retiro!',
        note: 'Notificación automática enviada al cliente por WhatsApp.',
        user: 'Sistema Automático',
        channel: 'whatsapp'
      }
    ]
  },
  {
    id: 'order-002',
    orderNumber: 'ORD-1043',
    clientName: 'Valeria Rossi',
    clientPhone: '5491144889922',
    clientEmail: 'valeria.rossi@outlook.com',
    clientDocument: '29.301.884',
    deviceType: 'notebook',
    brand: 'Lenovo',
    model: 'ThinkPad T490',
    color: 'Negro Mate',
    serialOrImei: 'PF-289B88X',
    passcode: 'Think2024!',
    physicalCondition: 'Excelente estado cosmético. Muy sucio interior por pelusa.',
    accessoriesIncluded: 'Cargador original Lenovo 65W USB-C',
    reportedIssue: 'Se apaga súbitamente a los 10 minutos de uso. El ventilador zumba con ruido metálico.',
    initialDiagnosis: 'Sobrecalentamiento térmico (Thermal Throttling a 98°C). Cooler trabado por suciedad y pasta térmica cristalizada.',
    technicianNotes: 'Desarme completo, limpieza por ultrasonido de disipador y cambio de cooler original. Se aplicó pasta Arctic MX-4. En prueba de stress rinde a 68°C máximo.',
    assignedTechnician: 'Gonzalo Silva',
    priority: 'normal',
    status: 'en_reparacion',
    createdAt: '2026-11-06T11:00:00.000Z',
    estimatedDate: '2026-11-08T15:00:00.000Z',
    laborCost: 26000,
    partsUsed: [
      {
        id: 'puse-2',
        partId: 'part-009',
        partName: 'Cooler Disipador Térmico Lenovo ThinkPad T480/T490',
        category: 'otros',
        quantity: 1,
        unitCost: 9500,
        unitPrice: 22000,
        source: 'nuevo'
      }
    ],
    discount: 2000,
    depositPaid: 15000,
    checklist: {
      encendido: true,
      pantallaTactil: false,
      camaras: true,
      carga: true,
      audioMicrofono: true,
      wifiBluetooth: true,
      botonesBiometria: true,
      senalesRed: true
    },
    budgetStatus: 'aprobado',
    warrantyDays: 90,
    timeline: [
      {
        id: 'tl-8',
        timestamp: '2026-11-06T11:00:00.000Z',
        status: 'ingresado',
        title: 'Ingreso al Taller',
        note: 'Recibido en mesón de entrada.',
        user: 'Recepcionista Ana',
        channel: 'sistema'
      },
      {
        id: 'tl-9',
        timestamp: '2026-11-06T16:30:00.000Z',
        status: 'diagnostico',
        title: 'Diagnóstico Confirmado',
        note: 'Falla de disipador térmico y suciedad crítica.',
        user: 'Gonzalo Silva',
        channel: 'sistema'
      },
      {
        id: 'tl-10',
        timestamp: '2026-11-07T09:30:00.000Z',
        status: 'en_reparacion',
        title: 'Mantenimiento en Proceso',
        note: 'En banco de desarme y cambio de componente térmico.',
        user: 'Gonzalo Silva',
        channel: 'sistema'
      }
    ]
  },
  {
    id: 'order-003',
    orderNumber: 'ORD-1044',
    clientName: 'Santiago Giménez',
    clientPhone: '5491166778899',
    clientEmail: 'santi.gimenez@gmail.com',
    clientDocument: '38.441.912',
    deviceType: 'tablet',
    brand: 'Apple',
    model: 'iPad Air 5 (10.9")',
    color: 'Starlight',
    serialOrImei: 'DMPV80AKQ16R',
    passcode: '000000',
    physicalCondition: 'Vidrio astillado en patrón de telaraña. Display interno enciende con mancha morada.',
    accessoriesIncluded: 'Sin accesorios',
    reportedIssue: 'Caída de mesa de escritorio. Se quebró el cristal y mancha el panel.',
    initialDiagnosis: 'Requiere reemplazo completo del módulo display laminado Liquid Retina.',
    technicianNotes: 'Se cotizó módulo nuevo. Esperando aprobación del presupuesto por parte del cliente.',
    assignedTechnician: 'Carlos Benítez',
    priority: 'normal',
    status: 'presupuestado',
    createdAt: '2026-11-06T16:00:00.000Z',
    estimatedDate: '2026-11-09T18:00:00.000Z',
    laborCost: 25000,
    partsUsed: [
      {
        id: 'puse-3',
        partId: 'part-004',
        partName: 'Módulo Display + Táctil iPad Air 5 (10.9")',
        category: 'pantalla',
        quantity: 1,
        unitCost: 58000,
        unitPrice: 110000,
        source: 'nuevo'
      }
    ],
    discount: 0,
    depositPaid: 0,
    checklist: {
      encendido: true,
      pantallaTactil: false,
      camaras: true,
      carga: true,
      audioMicrofono: true,
      wifiBluetooth: true,
      botonesBiometria: true,
      senalesRed: true
    },
    budgetStatus: 'pendiente_aprobacion',
    warrantyDays: 90,
    timeline: [
      {
        id: 'tl-11',
        timestamp: '2026-11-06T16:00:00.000Z',
        status: 'ingresado',
        title: 'Ingreso al Taller',
        note: 'Equipo ingresado sin seña.',
        user: 'Recepcionista Ana',
        channel: 'sistema'
      },
      {
        id: 'tl-12',
        timestamp: '2026-11-07T08:30:00.000Z',
        status: 'diagnostico',
        title: 'Diagnóstico Completado',
        note: 'Chasis plano no doblado, componentes internos OK.',
        user: 'Carlos Benítez',
        channel: 'sistema'
      },
      {
        id: 'tl-13',
        timestamp: '2026-11-07T09:00:00.000Z',
        status: 'presupuestado',
        title: 'Presupuesto Generado',
        note: 'Total $135.000 enviado con enlace de confirmación.',
        user: 'Carlos Benítez',
        channel: 'whatsapp'
      }
    ]
  },
  {
    id: 'order-004',
    orderNumber: 'ORD-1045',
    clientName: 'Lucía Fernández',
    clientPhone: '5491122334411',
    clientEmail: 'lucia.fdz@techstudio.ar',
    clientDocument: '36.192.834',
    deviceType: 'smartphone',
    brand: 'Samsung',
    model: 'Galaxy S22',
    color: 'Phantom Black',
    serialOrImei: '354918274019283',
    passcode: 'Patrón: Z invertida',
    physicalCondition: 'Con marcas de uso habituales. Tapa trasera intacta.',
    accessoriesIncluded: 'Sin accesorios',
    reportedIssue: 'Solo carga si se empuja el cable hacia arriba con fuerza. No lo reconoce la computadora.',
    initialDiagnosis: 'Pin USB-C con terminales rotos y sulfatación por humedad leve.',
    technicianNotes: 'Se reemplazó la plaqueta sub-board de carga original. Carga rápida 25W verificada.',
    assignedTechnician: 'Gonzalo Silva',
    priority: 'urgente',
    status: 'entregado',
    createdAt: '2026-11-04T10:00:00.000Z',
    estimatedDate: '2026-11-05T12:00:00.000Z',
    readyDate: '2026-11-05T11:30:00.000Z',
    deliveredDate: '2026-11-05T17:00:00.000Z',
    laborCost: 14000,
    partsUsed: [
      {
        id: 'puse-4',
        partId: 'part-003',
        partName: 'Módulo Placa Pin de Carga Samsung S22',
        category: 'pin_carga',
        quantity: 1,
        unitCost: 8500,
        unitPrice: 19500,
        source: 'nuevo'
      }
    ],
    discount: 0,
    depositPaid: 33500,
    checklist: {
      encendido: true,
      pantallaTactil: true,
      camaras: true,
      carga: true,
      audioMicrofono: true,
      wifiBluetooth: true,
      botonesBiometria: true,
      senalesRed: true
    },
    budgetStatus: 'aprobado',
    warrantyDays: 90,
    timeline: [
      {
        id: 'tl-14',
        timestamp: '2026-11-04T10:00:00.000Z',
        status: 'ingresado',
        title: 'Ingreso al Taller',
        note: 'Ingreso prioritario express.',
        user: 'Recepcionista Ana',
        channel: 'sistema'
      },
      {
        id: 'tl-15',
        timestamp: '2026-11-04T11:00:00.000Z',
        status: 'en_reparacion',
        title: 'En Banco',
        note: 'Sustitución de sub-board.',
        user: 'Gonzalo Silva',
        channel: 'sistema'
      },
      {
        id: 'tl-16',
        timestamp: '2026-11-05T11:30:00.000Z',
        status: 'listo',
        title: 'Listo para Retiro',
        note: 'Cliente notificada por WhatsApp.',
        user: 'Gonzalo Silva',
        channel: 'whatsapp'
      },
      {
        id: 'tl-17',
        timestamp: '2026-11-05T17:00:00.000Z',
        status: 'entregado',
        title: 'Entregado al Cliente',
        note: 'Abonado el saldo restante. Se emitió comprobante y garantía.',
        user: 'Recepcionista Ana',
        channel: 'sistema'
      }
    ]
  }
];

export const INITIAL_DONOR_DEVICES: DonorDevice[] = [
  {
    id: 'donor-001',
    code: 'DES-015',
    deviceType: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 12 128GB',
    color: 'Azul',
    serialOrImei: 'F17D90K00D84',
    entryDate: '2026-10-20',
    origin: 'cliente_abandono',
    purchaseCost: 15000,
    status: 'en_proceso',
    diagnosticSummary: 'Placa madre con corto circuito grave en línea principal tras caída en agua salada. Módulo de cámaras y batería en estado aprovechable.',
    parts: [
      {
        id: 'sp-1',
        name: 'Módulo Doble Cámara Trasera Original',
        componentType: 'camara',
        condition: 'excelente',
        extracted: true,
        extractedDate: '2026-10-22',
        inventoryPartId: 'part-007',
        suggestedPrice: 38000,
        costAssigned: 12000,
        notes: 'Extraído y testeado al 100%. Ya en inventario.'
      },
      {
        id: 'sp-2',
        name: 'Batería Original 2815mAh (89% Salud)',
        componentType: 'bateria',
        condition: 'bueno',
        extracted: false,
        suggestedPrice: 22000,
        costAssigned: 5000,
        notes: 'Salud 89% verificada en analizador tester'
      },
      {
        id: 'sp-3',
        name: 'Flex Puerto de Carga Lightning + Micrófono',
        componentType: 'pin_carga',
        condition: 'regular',
        extracted: false,
        suggestedPrice: 12000,
        costAssigned: 2000,
        notes: 'Requiere limpieza de pelusa en conector'
      },
      {
        id: 'sp-4',
        name: 'Parlante Altavoz Auricular + Sensor Proximidad',
        componentType: 'otros',
        condition: 'bueno',
        extracted: false,
        suggestedPrice: 14000,
        costAssigned: 3000,
        notes: 'Imán y membrana en perfecto estado'
      },
      {
        id: 'sp-5',
        name: 'Bandeja SIM Azul Original',
        componentType: 'carcasa_bisagra',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 5000,
        costAssigned: 500,
        notes: 'Goma de sellado estanco sana'
      },
      {
        id: 'sp-6',
        name: 'Placa Lógica Madre (Cortocircuito PMIC)',
        componentType: 'placa_motherboard',
        condition: 'dañado',
        extracted: false,
        suggestedPrice: 0,
        costAssigned: 0,
        notes: 'Dañada irreparable, reservada para donación de microcomponentes SMD'
      }
    ]
  },
  {
    id: 'donor-002',
    code: 'DES-018',
    deviceType: 'notebook',
    brand: 'HP',
    model: 'Pavilion 15-dw1024la',
    color: 'Gris Plata',
    serialOrImei: '5CD03819KZ',
    entryDate: '2026-10-28',
    origin: 'compra_lote',
    purchaseCost: 28000,
    status: 'disponible_despiece',
    diagnosticSummary: 'Equipo recibido en lote con procesador quemado por sobretensión en cargador genérico. Pantalla LED, teclado, bisagras y cooler intactos.',
    parts: [
      {
        id: 'sp-7',
        name: 'Pantalla 15.6" LED Slim 30 Pines FHD (1920x1080)',
        componentType: 'pantalla',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 65000,
        costAssigned: 15000,
        notes: 'Sin rayones ni píxeles muertos, conector de 30 pines eDP'
      },
      {
        id: 'sp-8',
        name: 'Teclado Español Latino con Topcase Integrado',
        componentType: 'teclado',
        condition: 'bueno',
        extracted: false,
        suggestedPrice: 32000,
        costAssigned: 7000,
        notes: 'Teclas firmes, sin desgaste de serigrafía'
      },
      {
        id: 'sp-9',
        name: 'Batería Interna 3 Celdas HT03XL',
        componentType: 'bateria',
        condition: 'regular',
        extracted: false,
        suggestedPrice: 20000,
        costAssigned: 4000,
        notes: 'Retiene aprox 2 horas de carga'
      },
      {
        id: 'sp-10',
        name: 'Juego de Bisagras Izquierda y Derecha',
        componentType: 'carcasa_bisagra',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 18000,
        costAssigned: 3000,
        notes: 'Ejes con torque normal, sin juego'
      },
      {
        id: 'sp-11',
        name: 'Tarjeta Módulo Wi-Fi + Bluetooth Realtek M.2',
        componentType: 'otros',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 9000,
        costAssigned: 1500,
        notes: 'Probada en slot M.2'
      }
    ]
  },
  {
    id: 'donor-003',
    code: 'DES-022',
    deviceType: 'tablet',
    brand: 'Samsung',
    model: 'Galaxy Tab S7 11"',
    color: 'Mystic Black',
    serialOrImei: 'R52N90ALZ4P',
    entryDate: '2026-11-01',
    origin: 'garantia_cambio',
    purchaseCost: 20000,
    status: 'disponible_despiece',
    diagnosticSummary: 'Bloqueada por cuenta Knox de empresa dada de baja. Componentes de hardware 100% operativos.',
    parts: [
      {
        id: 'sp-12',
        name: 'Pantalla 11" LTPS 120Hz Samsung Tab S7',
        componentType: 'pantalla',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 85000,
        costAssigned: 18000,
        notes: 'Panel original 120Hz impecable'
      },
      {
        id: 'sp-13',
        name: 'Batería 8000mAh Original',
        componentType: 'bateria',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 28000,
        costAssigned: 6000,
        notes: '95% de capacidad de fábrica'
      },
      {
        id: 'sp-14',
        name: 'Set de 4 Altavoces AKG Cuádruples',
        componentType: 'otros',
        condition: 'excelente',
        extracted: false,
        suggestedPrice: 19000,
        costAssigned: 3500,
        notes: 'Sonido Dolby Atmos impecable'
      },
      {
        id: 'sp-15',
        name: 'Módulo Pin de Carga USB-C 45W',
        componentType: 'pin_carga',
        condition: 'bueno',
        extracted: false,
        suggestedPrice: 16000,
        costAssigned: 3000,
        notes: 'Soporta Super Fast Charging 2.0'
      }
    ]
  }
];
