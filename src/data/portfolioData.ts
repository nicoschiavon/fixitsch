import { ProjectItem } from '../types';

export interface DeveloperProfile {
  name: string;
  role: string;
  tagline: string;
  email: string;
  whatsapp: string;
  github: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}

export const DEVELOPER_PROFILE: DeveloperProfile = {
  name: 'Nico Schiavon',
  role: 'Full Stack Software Engineer & Tech Builder',
  tagline: 'Desarrollo soluciones digitales de alto impacto, plataformas SaaS y herramientas de gestión a medida.',
  email: 'nico.schiavon@gmail.com',
  whatsapp: '5491145678900',
  github: 'https://github.com/nicoschiavon',
  instagram: 'https://instagram.com/nicoschiavon',
  facebook: 'https://facebook.com/nicoschiavon.tech',
  linkedin: 'https://linkedin.com/in/nicoschiavon',
  bio: 'Especialista en desarrollo web moderno, arquitectura de sistemas y automatización comercial. Apasionado por construir herramientas que simplifican el día a día de negocios y servicios técnicos.'
};

export const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-fixitsch',
    title: 'FixiTsch Pro',
    category: 'SaaS para Talleres & Laboratorios',
    description: 'Sistema integral de gestión de órdenes de reparación para celulares, tablets y notebooks, con módulo pionero de despiece de huesera, inventario y seguimiento online para clientes.',
    tags: ['React 19', 'TypeScript', 'Tailwind CSS', 'SaaS', 'Hardware Repair'],
    features: [
      'Seguimiento en tiempo real con portal para clientes',
      'Notificaciones automáticas por WhatsApp y Correo',
      'Módulo de despiece & recuperación de repuestos',
      'Control de calidad con checklist técnico de 8 puntos'
    ],
    status: 'Producción',
    url: '#',
    githubUrl: 'https://github.com/nicoschiavon/fixitsch'
  },
  {
    id: 'proj-gastroflow',
    title: 'GastroFlow POS',
    category: 'Gastronomía & Gestión Comercial',
    description: 'Sistema de punto de venta y comandas digitales para restaurantes, cafeterías y bares. Control de mesas en tiempo real, comanderas de cocina e integración con menú digital QR.',
    tags: ['Next.js', 'PostgreSQL', 'WebSockets', 'POS System'],
    features: [
      'Envío instantáneo de comandas a barra y cocina',
      'Gestión de inventario de insumos por receta',
      'Carta QR interactiva con pedidos desde la mesa',
      'Cierre de caja Z y reportes de facturación diaria'
    ],
    status: 'Producción',
    url: 'https://gastroflow-demo.dev',
    githubUrl: 'https://github.com/nicoschiavon/gastroflow-pos'
  },
  {
    id: 'proj-logistiq',
    title: 'LogistiQ Express',
    category: 'Logística & Última Milla',
    description: 'Plataforma de optimización de rutas y trazabilidad de envíos urbanos. Permite a choferes registrar entregas con firma digital en pantalla y geolocalización en tiempo real.',
    tags: ['TypeScript', 'Maps API', 'PWA Mobile', 'Logistics'],
    features: [
      'Rutas de entrega calculadas por menor tiempo y tráfico',
      'Firma táctil digital y foto de comprobante de entrega',
      'Link de seguimiento en vivo enviado por WhatsApp al destinatario',
      'Métricas de tiempo de entrega y rendimiento por conductor'
    ],
    status: 'Beta Activa',
    url: 'https://logistiq-express.dev',
    githubUrl: 'https://github.com/nicoschiavon/logistiq-tracker'
  },
  {
    id: 'proj-autoparts',
    title: 'AutoParts Hub B2B',
    category: 'E-commerce & Catálogo Mayorista',
    description: 'Portal de comercio electrónico mayorista para distribuidoras de repuestos automotrices con buscador inteligente por código OEM, número de chasis (VIN) y marcas compatibles.',
    tags: ['React', 'ElasticSearch', 'Tailwind CSS', 'B2B Wholesale'],
    features: [
      'Búsqueda instantánea de repuestos entre más de 120.000 códigos',
      'Precios diferenciados por categoría de cliente mayorista',
      'Generación de presupuestos formales en PDF en 1 clic',
      'Integración con sistemas ERP contables tradicionales'
    ],
    status: 'Producción',
    url: 'https://autoparts-hub.dev',
    githubUrl: 'https://github.com/nicoschiavon/autoparts-hub'
  },
  {
    id: 'proj-whatsbot',
    title: 'WhatsConnect CRM',
    category: 'Automatización & Mensajería',
    description: 'Centro de atención multicanal para WhatsApp Business API. Distribuye chats entre técnicos y asesores comerciales, automatizando respuestas de estado de reparación y presupuestos.',
    tags: ['Node.js', 'WhatsApp API', 'AI Agents', 'CRM'],
    features: [
      'Respuestas automáticas de consultas frecuentes 24/7',
      'Envío masivo de recordatorios y promociones segmentadas',
      'Panel centralizado para múltiples operadores',
      'Historial de conversaciones unificado por cliente'
    ],
    status: 'Beta Activa',
    url: 'https://whatsconnect-crm.dev',
    githubUrl: 'https://github.com/nicoschiavon/whatsconnect-crm'
  }
];
