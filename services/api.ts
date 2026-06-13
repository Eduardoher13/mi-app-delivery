import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

import { AUTH_TOKEN_KEY } from '../utils/constants';

const apiBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  '';

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl || 'http://localhost:3000',
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

// TODO: conectar endpoints reales del backend NestJS
// Ejemplo: export const getServices = () => api.get('/services');

export default api;
