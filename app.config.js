/** @type {import('expo/config').ExpoConfig} */
require('dotenv').config({ path: '.env' });

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
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#00A878',
      foregroundImage: './assets/icon.png',
    },
    package: 'com.casaia.app',
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
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
    router: {},
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
  },
});
