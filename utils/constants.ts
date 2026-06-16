import { Category } from '../types';

export const MOCK_USER = {
  id: '123',
  name: 'Usuario Demo',
  initials: 'UD',
} as const;

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

export const AUTH_TOKEN_KEY = '@casaia/auth_token';
export const AUTH_USER_KEY = '@casaia/user';

/** Usuario empresa del seed del backend (npm run seed en casa-ia-desk) */
export const DEMO_EMPRESA_EMAIL = 'tienda@empresa.com';

/** Supabase Storage — un bucket con carpetas internas */
export const SUPABASE_STORAGE_BUCKET = 'product_images';
export const SUPABASE_FOLDER_AVATARS = 'avatars';
export const SUPABASE_FOLDER_PRODUCTS = 'image-product';
