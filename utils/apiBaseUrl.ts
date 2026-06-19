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

/**
 * Resuelve la URL del backend NestJS.
 * En desarrollo con Expo Go usa la misma IP que Metro (cambia sola al cambiar de WiFi).
 * En builds EAS/APK usa EXPO_PUBLIC_API_BASE_URL o extra.apiBaseUrl (Render, etc.).
 */
export function resolveApiBaseUrl(): string {
  const port = getConfiguredPort();
  const explicit = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');
  const fromExtra = getExtraApiBaseUrl();

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
  const explicit = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim());
  const fromExtra = getExtraApiBaseUrl();

  let source = 'default (localhost)';
  if (__DEV__ && metroHost) {
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
