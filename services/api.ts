import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

import { getApiStatus, getApiTimeoutMs, resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { AUTH_TOKEN_KEY } from '../utils/constants';

export { getApiStatus, resolveApiBaseUrl };

const API_TIMEOUT_MS = getApiTimeoutMs();

export const api: AxiosInstance = axios.create({
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = resolveApiBaseUrl();

    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token && token !== 'mock-jwt-token-casaia') {
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
    const coldStartHint = baseURL.startsWith('https://')
      ? ' El servidor en Render puede tardar ~1 min en despertar; intenta de nuevo.'
      : '';
    return `Timeout al conectar con ${baseURL}.${coldStartHint}`;
  }

    if (error.message === 'Network Error' || !error.response) {
    if (baseURL.startsWith('https://')) {
      return (
        `No se alcanza el backend en ${baseURL}. ` +
        'Comprueba datos/WiFi. Si el servidor en Render está dormido, espera ~1 min e intenta otra vez.'
      );
    }

    const webHint =
      Platform.OS === 'web'
        ? ' En web usa EXPO_PUBLIC_API_BASE_URL en .env (p. ej. Render).'
        : '';

    return (
      `No se alcanza el backend en ${baseURL}.` +
      webHint +
      ' Misma WiFi que la Mac, o reinicia Metro con --clear.'
    );
  }

  return error.response.data?.message ?? error.message ?? fallback;
}

export default api;
