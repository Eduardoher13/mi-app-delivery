import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { MANAGUA_COORDS } from '../utils/constants';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  coords: LocationCoords;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<LocationCoords>({
    latitude: MANAGUA_COORDS.latitude,
    longitude: MANAGUA_COORDS.longitude,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      setError('No se pudo obtener la ubicación');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void requestPermission();
  }, [requestPermission]);

  return { coords, loading, error, requestPermission };
}
