import { useEffect, useRef, useState } from 'react';

import { postTrackingPing, TrackingPoint } from '../services/deliveryTracking';
import { LatLng } from '../utils/decodePolyline';
import { positionAlongRoute } from '../utils/deliveryRoute';

interface UseDeliveryTrackingOptions {
  deliveryId?: string | null;
  route: LatLng[];
  /** Pasos de la simulación (cada paso = un tick de 2s). */
  steps?: number;
  enabled?: boolean;
  /** Si true, envía POST /delivery-tracking en cada paso. */
  postPings?: boolean;
  onArrived?: () => void;
}

interface UseDeliveryTrackingResult {
  driverPosition: LatLng | null;
  trackingPoints: TrackingPoint[];
  progress: number;
  arrived: boolean;
  loading: boolean;
}

const TICK_MS = 2000;

/**
 * Simula el movimiento del repartidor a lo largo de la ruta interpolando su
 * posición cada 2s y (opcionalmente) registrando pings en el backend.
 */
export function useDeliveryTracking({
  deliveryId,
  route,
  steps = 20,
  enabled = true,
  postPings = true,
  onArrived,
}: UseDeliveryTrackingOptions): UseDeliveryTrackingResult {
  const [driverPosition, setDriverPosition] = useState<LatLng | null>(null);
  const [trackingPoints, setTrackingPoints] = useState<TrackingPoint[]>([]);
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);

  const stepRef = useRef(0);
  const onArrivedRef = useRef(onArrived);
  onArrivedRef.current = onArrived;

  const routeKey = route.length > 0
    ? `${route.length}:${route[0].latitude},${route[0].longitude}`
    : 'empty';

  useEffect(() => {
    if (!enabled || route.length === 0) {
      return;
    }

    stepRef.current = 0;
    setArrived(false);
    setProgress(0);
    setDriverPosition(route[0]);

    const totalSteps = Math.max(1, steps);
    let cancelled = false;

    const interval = setInterval(() => {
      stepRef.current += 1;
      const currentProgress = Math.min(1, stepRef.current / totalSteps);
      const position = positionAlongRoute(route, currentProgress);

      if (cancelled) {
        return;
      }

      setProgress(currentProgress);
      if (position) {
        setDriverPosition(position);

        if (postPings && deliveryId) {
          void postTrackingPing(deliveryId, position.latitude, position.longitude)
            .then((point) => {
              if (!cancelled) {
                setTrackingPoints((prev) => [...prev, point]);
              }
            })
            .catch(() => {
              // Ignorar fallos de ping para no romper la simulación demo.
            });
        }
      }

      if (currentProgress >= 1) {
        clearInterval(interval);
        if (!cancelled) {
          setArrived(true);
          onArrivedRef.current?.();
        }
      }
    }, TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [routeKey, enabled, deliveryId, steps, postPings]);

  return {
    driverPosition,
    trackingPoints,
    progress,
    arrived,
    loading: route.length === 0,
  };
}
