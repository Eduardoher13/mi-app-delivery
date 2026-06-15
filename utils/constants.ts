import { Category, Product, ServiceProvider } from '../types';

export const MOCK_USER = {
  id: '123',
  name: 'Usuario Demo',
  initials: 'UD',
} as const;

export const MOCK_CART = {
  itemCount: 3,
  total: 131.5,
} as const;

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Electricidad', icon: 'flash' },
  { id: '2', name: 'Fontanería', icon: 'water' },
  { id: '3', name: 'Jardinería', icon: 'leaf' },
  { id: '4', name: 'Pintura', icon: 'color-palette' },
  { id: '5', name: 'Remodelación', icon: 'hammer' },
  { id: '6', name: 'Emergencia', icon: 'alert-circle' },
];

export const FEATURED_SERVICES: ServiceProvider[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'Fontanero',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/plumber/200/200',
    price: 45,
  },
  {
    id: '2',
    name: 'Ana Rodríguez',
    role: 'Electricista',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/electrician/200/200',
    price: 55,
  },
  {
    id: '3',
    name: 'Luis García',
    role: 'Jardinero',
    rating: 4.7,
    imageUrl: 'https://picsum.photos/seed/gardener/200/200',
    price: 35,
  },
];

export const RECOMMENDED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Taladro Percutor 20V',
    price: 89.99,
    imageUrl: 'https://picsum.photos/seed/drill/300/300',
    category: 'Herramientas',
  },
  {
    id: '2',
    name: 'Set Destornilladores Pro',
    price: 24.5,
    imageUrl: 'https://picsum.photos/seed/screwdriver/300/300',
    category: 'Herramientas',
  },
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
