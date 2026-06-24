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

/**
 * Resuelve la URL del backend NestJS.
 * - Web / Expo Go: EXPO_PUBLIC_API_BASE_URL (DigitalOcean) si está definida.
 * - Builds EAS/APK: EXPO_PUBLIC_API_BASE_URL o extra.apiBaseUrl.
 */
export function resolveApiBaseUrl(): string {
  const port = getConfiguredPort();
  const explicit = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');
  const fromExtra = getExtraApiBaseUrl();
  const remoteUrl = getRemoteConfiguredUrl(explicit, fromExtra);

  if (Platform.OS === 'web') {
    if (remoteUrl) {
      return remoteUrl;
    }

    if (explicit) {
      return explicit;
    }

    return buildUrl('127.0.0.1', port);
  }

  if (__DEV__) {
    // Si definiste una URL remota (Render/DO), úsala también en Expo Go.
    if (remoteUrl) {
      return remoteUrl;
    }

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
  const explicit = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim());
  const fromExtra = getExtraApiBaseUrl();
  const remoteUrl = getRemoteConfiguredUrl(
    normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? ''),
    fromExtra,
  );

  let source = 'default (localhost)';
  if (Platform.OS === 'web' && baseURL.startsWith('https://')) {
    source = explicit
      ? 'EXPO_PUBLIC_API_BASE_URL (web)'
      : 'app.config extra (web)';
  } else if (__DEV__ && remoteUrl && baseURL === remoteUrl) {
    source = explicit
      ? 'EXPO_PUBLIC_API_BASE_URL (dev remoto)'
      : 'app.config extra (dev remoto)';
  } else if (__DEV__ && metroHost) {
    source = 'Metro host (auto)';
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
