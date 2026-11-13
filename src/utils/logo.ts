export const LOGO_MAX_BYTES = 120 * 1024;
export const LOGO_DATA_URL_MAX_LENGTH = 180_000;
export const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

const LOGO_DATA_URL = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

export function isLogoDataUrl(value: string): boolean {
  return value.length > 0 && value.length <= LOGO_DATA_URL_MAX_LENGTH && LOGO_DATA_URL.test(value);
}

export function readLogoFile(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    return Promise.reject(new Error('El logo tiene que ser PNG, JPG, WebP o GIF.'));
  }
  if (file.size > LOGO_MAX_BYTES) {
    return Promise.reject(new Error('El logo no puede pesar más de 120 KB.'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '').replace(/\s/g, '');
      if (!isLogoDataUrl(value)) {
        reject(new Error('No se pudo leer el logo.'));
        return;
      }
      resolve(value);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el logo.'));
    reader.readAsDataURL(file);
  });
}
