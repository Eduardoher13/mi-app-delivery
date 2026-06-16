/** @type {import('expo/config').ExpoConfig} */
const os = require('os');

require('dotenv').config({ path: '.env' });

const API_PORT = process.env.EXPO_PUBLIC_API_PORT?.trim() || '8001';

function getLanIp() {
  const interfaces = os.networkInterfaces();
  const prefer = ['en0', 'en1', 'wlan0', 'eth0'];

  for (const name of prefer) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        return iface.address;
      }
    }
  }

  for (const addrs of Object.values(interfaces)) {
    for (const iface of addrs ?? []) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        return iface.address;
      }
    }
  }

  return '127.0.0.1';
}

const autoApiBaseUrl = `http://${getLanIp()}:${API_PORT}`;

module.exports = ({ config }) => ({
  ...config,
  name: 'CasaIA',
  slug: 'casaia',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'casaia',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.casaia.app',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    },
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#00A878',
      foregroundImage: './assets/icon.png',
    },
    package: 'com.casaia.app',
    usesCleartextTraffic: true,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  web: {
    favicon: './assets/icon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'CasaIA necesita acceder a tu ubicación para mostrar profesionales cercanos.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'CasaIA necesita acceder a tus fotos para subir imágenes de perfil.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    apiPort: API_PORT,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || autoApiBaseUrl,
    router: {},
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
  },
});
