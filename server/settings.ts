export type WorkshopSettings = {
  workshopName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  taxId: string;
  defaultWarrantyDays: number;
  currencySymbol: string;
  termsConditions: string;
  whatsappReadyTemplate: string;
  whatsappBudgetTemplate: string;
  logoDataUrl: string;
};

const LOGO_DATA_URL = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
const LOGO_DATA_URL_MAX_LENGTH = 180_000;

/** Vacío si no hay logo. null si vino algo y no es una imagen chica permitida. */
export function sanitizeLogoDataUrl(value: unknown): string | null {
  if (value == null) return '';
  if (typeof value !== 'string') return null;
  const compact = value.trim().replace(/\s/g, '');
  if (!compact) return '';
  if (compact.length > LOGO_DATA_URL_MAX_LENGTH || !LOGO_DATA_URL.test(compact)) return null;
  return compact;
}

export function emptySettings(workshopName: string): WorkshopSettings {
  return {
    workshopName,
    tagline: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    taxId: '',
    defaultWarrantyDays: 90,
    currencySymbol: '$',
    termsConditions: '',
    whatsappReadyTemplate:
      'Hola {cliente}, tu equipo ya está listo para retirar. Orden #{orden}. Saldo: {saldo}.',
    whatsappBudgetTemplate:
      'Hola {cliente}, te enviamos el presupuesto de la orden #{orden} por {total}.',
    logoDataUrl: '',
  };
}
