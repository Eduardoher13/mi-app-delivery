import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

import { ApiProduct, Product } from '../types';
import { AUTH_TOKEN_KEY } from '../utils/constants';

const apiBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  '';

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function extractImageUrl(description: string): string {
  const match = description.match(/Imagen:\s*(https?:\/\/\S+)/);
  return match?.[1] ?? 'https://picsum.photos/seed/product/400/400';
}

function mapApiProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    price: Number.parseFloat(product.price),
    imageUrl: extractImageUrl(product.description),
    category: 'Ferretería',
  };
}

/** GET /products — el backend devuelve [items, total] */
export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<[ApiProduct[], number]>('/products');
  const [items] = data;
  return items.filter((p) => p.is_active).map(mapApiProduct);
}

export default api;
