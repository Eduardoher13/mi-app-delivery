import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { getApiStatus, resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { AUTH_TOKEN_KEY } from '../utils/constants';

export { getApiStatus, resolveApiBaseUrl };

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
