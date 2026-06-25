import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = '8001';

function getConfiguredPort(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiPort;
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return fromExtra.trim();
  }

  const fromEnv = process.env.EXPO_PUBLIC_API_PORT?.trim();
  return fromEnv || DEFAULT_API_PORT;
}

/** Host del bundler Metro (misma IP que usa Expo Go para cargar la app). */
function getMetroHost(): string | null {
  const raw =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri;

  if (!raw || typeof raw !== 'string') {
    return null;
  }

  const host = raw
    .replace(/^exp:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .trim();

  return host || null;
}

function buildUrl(host: string, port: string): string {
  return `http://${host}:${port}`.replace(/\/$/, '');
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function getExtraApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  return typeof fromExtra === 'string' ? normalizeBaseUrl(fromExtra) : '';
}

function isLocalBaseUrl(url: string): boolean {
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    /^http:\/\/(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\./.test(url)
  );
}

function getRemoteConfiguredUrl(explicit: string, fromExtra: string): string {
  if (explicit && !isLocalBaseUrl(explicit)) {
    return explicit;
  }

  if (fromExtra && !isLocalBaseUrl(fromExtra)) {
    return fromExtra;
  }

  return '';
}

function getProductionApiUrl(): string {
  const fromExtra = getExtraApiBaseUrl();
  const explicit = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');

  if (fromExtra.startsWith('https://')) {
    return fromExtra;
  }

  if (explicit.startsWith('https://')) {
    return explicit;
  }

  return '';
}

/**
 * Resuelve la URL del backend NestJS.
 * Si EXPO_PUBLIC_API_BASE_URL apunta a producción (https), siempre se usa —
 * nunca el backend local de Metro en desarrollo.
 */
export function resolveApiBaseUrl(): string {
  const port = getConfiguredPort();
  const productionUrl = getProductionApiUrl();

  if (productionUrl) {
    return productionUrl;
  }

  const fromExtra = getExtraApiBaseUrl();
  const explicit = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');

  if (Platform.OS === 'web') {
    if (explicit) {
      return explicit;
    }

    return buildUrl('127.0.0.1', port);
  }

  if (__DEV__) {
    const metroHost = getMetroHost();
    if (metroHost) {
      if (metroHost === 'localhost' || metroHost.startsWith('127.')) {
        return buildUrl('127.0.0.1', port);
      }
      return buildUrl(metroHost, port);
    }

    if (fromExtra) {
      return fromExtra;
    }
  }

  if (explicit) {
    return explicit;
  }

  if (fromExtra && !isLocalBaseUrl(fromExtra)) {
    return fromExtra;
  }

  return buildUrl('127.0.0.1', port);
}

export function getApiStatus() {
  const baseURL = resolveApiBaseUrl();
  const metroHost = getMetroHost();
  const productionUrl = getProductionApiUrl();
  const explicit = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim());
  const fromExtra = getExtraApiBaseUrl();

  let source = 'default (localhost)';
  if (productionUrl && baseURL === productionUrl) {
    source = explicit
      ? 'EXPO_PUBLIC_API_BASE_URL (producción)'
      : 'app.config extra (producción)';
  } else if (Platform.OS === 'web' && baseURL.startsWith('https://')) {
    source = explicit
      ? 'EXPO_PUBLIC_API_BASE_URL (web)'
      : 'app.config extra (web)';
  } else if (__DEV__ && metroHost) {
    source = 'Metro host (local)';
  } else if (explicit) {
    source = 'EXPO_PUBLIC_API_BASE_URL';
  } else if (fromExtra && !isLocalBaseUrl(fromExtra)) {
    source = 'app.config extra (EAS)';
  } else if (fromExtra) {
    source = 'app.config extra (auto)';
  }

  return {
    baseURL,
    source,
    port: getConfiguredPort(),
    metroHost,
    isLocalhost: isLocalBaseUrl(baseURL),
  };
}

export function getApiTimeoutMs(): number {
  if (!__DEV__) {
    return 90_000;
  }

  if (Platform.OS === 'web' && resolveApiBaseUrl().startsWith('https://')) {
    return 90_000;
  }

  if (__DEV__ && resolveApiBaseUrl().startsWith('https://')) {
    return 90_000;
  }

  return 15_000;
}
