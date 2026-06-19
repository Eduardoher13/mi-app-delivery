import * as Location from 'expo-location';

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

async function ensureForegroundLocationPermission(): Promise<boolean> {
  let { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Location.requestForegroundPermissionsAsync());
  }

  return status === 'granted';
}

/** Precalienta permisos y caché de GPS para respuestas más rápidas al pulsar el botón. */
export async function warmUpDeviceLocation(): Promise<void> {
  try {
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
    throw new Error('Permiso de ubicación denegado');
  }

  const last = await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
  if (last) {
    return {
      latitude: last.coords.latitude,
      longitude: last.coords.longitude,
    };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Lowest,
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
