import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

import { AUTH_TOKEN_KEY } from '../utils/constants';

export function resolveApiBaseUrl(): string {
  const url = (
    Constants.expoConfig?.extra?.apiBaseUrl ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    ''
  ).trim();

  if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url.replace(/\/$/, '');
  }

  return url.replace(/\/$/, '') || 'http://localhost:8001';
}

export function getApiStatus() {
  const baseURL = resolveApiBaseUrl();
  const fromExtra = Boolean(Constants.expoConfig?.extra?.apiBaseUrl);

  return {
    baseURL,
    source: fromExtra ? 'app.config extra' : 'process.env',
    isLocalhost: baseURL.includes('localhost') || baseURL.includes('127.0.0.1'),
  };
}

export const api: AxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = resolveApiBaseUrl();

    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export function formatApiError(error: unknown, fallback = 'Error de conexión'): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const baseURL = resolveApiBaseUrl();

  if (error.code === 'ECONNABORTED') {
    return `Timeout al conectar con ${baseURL}`;
  }

  if (error.message === 'Network Error' || !error.response) {
    return (
      `No se alcanza el backend en ${baseURL}. ` +
      'En el Honor: misma WiFi que la Mac, abre Chrome → esa URL. Reinicia Metro con --clear.'
    );
  }

  return error.response.data?.message ?? error.message ?? fallback;
}

export default api;
