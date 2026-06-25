import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Electricidad', icon: 'flash', slug: 'electricidad' },
  { id: '2', name: 'Fontanería', icon: 'water', slug: 'fontaneria' },
  { id: '3', name: 'Jardinería', icon: 'leaf', slug: 'jardineria' },
  { id: '4', name: 'Pintura', icon: 'color-palette', slug: 'pintura' },
  { id: '5', name: 'Remodelación', icon: 'hammer', slug: 'remodelacion' },
  { id: '6', name: 'Emergencia', icon: 'alert-circle', slug: 'emergencia' },
];

export const MANAGUA_COORDS = {
  latitude: 12.119,
  longitude: -86.274,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
} as const;

/** Origen del reparto (ferretería en Managua). */
export const DELIVERY_PICKUP_COORDS = {
  latitude: 12.119,
  longitude: -86.274,
} as const;

export const DELIVERY_PICKUP_ADDRESS = 'Ferretería, Managua, Nicaragua';

/** @deprecated Usar ubicación del dispositivo vía getDeviceDeliveryCoords() */
export const DELIVERY_DROPOFF_COORDS = {
  latitude: 12.125,
  longitude: -86.28,
} as const;

/** @deprecated Usar ubicación del dispositivo vía getDeviceDeliveryCoords() */
export const DELIVERY_DROPOFF_ADDRESS = 'Managua, Nicaragua';

export const AUTH_TOKEN_KEY = '@listo/auth_token';
export const AUTH_USER_KEY = '@listo/user';

/** Cuenta demo cliente para pruebas del jurado (npm run seed en backend). */
export const DEMO_CLIENTE_EMAIL = 'demo@cliente.com';
export const DEMO_PASSWORD = 'demo123';

/** Supabase Storage — un bucket con carpetas internas */
export const SUPABASE_STORAGE_BUCKET = 'product_images';
export const SUPABASE_FOLDER_AVATARS = 'avatars';
export const SUPABASE_FOLDER_PRODUCTS = 'image-product';
export const SUPABASE_FOLDER_COMPANY_LOGOS = 'company-logos';

/** @deprecated Los IDs de API (ej. 20) no coinciden con category.id local ('2'). Usa getSpecialtyNameById en services/specialties.ts */
export function getSpecialtyNameById(specialtyId: number): string {
  const category = CATEGORIES.find((item) => item.id === String(specialtyId));
  return category?.name ?? `Especialidad #${specialtyId}`;
}
