import * as Location from 'expo-location';

import { MANAGUA_COORDS } from './constants';

export interface DeviceCoords {
  latitude: number;
  longitude: number;
  addressLabel: string;
}

/** Ubicación actual del dispositivo para destino de entrega; fallback Managua si falla. */
export async function getDeviceDeliveryCoords(): Promise<DeviceCoords> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return managuaFallback('Ubicación no permitida — Managua (demo)');
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;

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
