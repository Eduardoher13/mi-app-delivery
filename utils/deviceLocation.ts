import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { MANAGUA_COORDS } from './constants';

export interface DeviceCoords {
  latitude: number;
  longitude: number;
  addressLabel: string;
}

export interface MapCoords {
  latitude: number;
  longitude: number;
}

function assertWebLocationContext(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  if (!window.isSecureContext) {
    throw new Error(
      'La ubicación en Safari requiere HTTPS. Abre el enlace seguro del sitio (no http://).',
    );
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Tu navegador no admite geolocalización.');
  }
}

async function ensureForegroundLocationPermission(): Promise<boolean> {
  assertWebLocationContext();

  let { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Location.requestForegroundPermissionsAsync());
  }

  return status === 'granted';
}

/** Precalienta permisos y caché de GPS para respuestas más rápidas al pulsar el botón. */
export async function warmUpDeviceLocation(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    const granted = await ensureForegroundLocationPermission();
    if (!granted) {
      return;
    }

    await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
  } catch {
    // Ignorar: el botón volverá a intentarlo.
  }
}

/** Ubicación rápida para el mapa: usa la última posición conocida y solo GPS si hace falta. */
export async function getFastMapCoords(): Promise<MapCoords> {
  const granted = await ensureForegroundLocationPermission();
  if (!granted) {
    throw new Error(
      Platform.OS === 'web'
        ? 'Permiso de ubicación denegado. En iPhone: Ajustes → Safari → Ubicación.'
        : 'Permiso de ubicación denegado',
    );
  }

  if (Platform.OS !== 'web') {
    const last = await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
    if (last) {
      return {
        latitude: last.coords.latitude,
        longitude: last.coords.longitude,
      };
    }
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.Lowest,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

/** Ubicación actual del dispositivo para destino de entrega; fallback Managua si falla. */
export async function getDeviceDeliveryCoords(): Promise<DeviceCoords> {
  try {
    const coords = await getFastMapCoords();
    const { latitude, longitude } = coords;

    return {
      latitude,
      longitude,
      addressLabel: `Tu ubicación (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    };
  } catch {
    return managuaFallback('Managua, Nicaragua (ubicación no disponible)');
  }
}

function managuaFallback(label: string): DeviceCoords {
  return {
    latitude: MANAGUA_COORDS.latitude,
    longitude: MANAGUA_COORDS.longitude,
    addressLabel: label,
  };
}
