import Constants from 'expo-constants';

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

/**
 * Resuelve la URL del backend NestJS.
 * En desarrollo con Expo Go usa la misma IP que Metro (cambia sola al cambiar de WiFi).
 * EXPO_PUBLIC_API_BASE_URL solo como override manual (producción o casos especiales).
 */
export function resolveApiBaseUrl(): string {
  const port = getConfiguredPort();
  const explicit = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim();

  if (__DEV__) {
    const metroHost = getMetroHost();
    if (metroHost) {
      if (metroHost === 'localhost' || metroHost.startsWith('127.')) {
        return buildUrl('127.0.0.1', port);
      }
      return buildUrl(metroHost, port);
    }

    const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
    if (typeof fromExtra === 'string' && fromExtra.trim()) {
      return fromExtra.trim().replace(/\/$/, '');
    }
  }

  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  return buildUrl('127.0.0.1', port);
}

export function getApiStatus() {
  const baseURL = resolveApiBaseUrl();
  const metroHost = getMetroHost();
  const explicit = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim());

  let source = 'default (localhost)';
  if (__DEV__ && metroHost) {
    source = 'Metro host (auto)';
  } else if (Constants.expoConfig?.extra?.apiBaseUrl) {
    source = 'app.config extra (auto)';
  } else if (explicit) {
    source = 'EXPO_PUBLIC_API_BASE_URL';
  }

  return {
    baseURL,
    source,
    port: getConfiguredPort(),
    metroHost,
    isLocalhost: baseURL.includes('localhost') || baseURL.includes('127.0.0.1'),
  };
}
