import { LatLng } from './decodePolyline';

/**
 * Ruta demo: interpola una línea recta entre origen y destino con N puntos.
 * Útil cuando no hay polyline real de Google Directions.
 */
export function buildStraightRoute(
  from: LatLng,
  to: LatLng,
  steps = 20,
): LatLng[] {
  const points: LatLng[] = [];
  const segments = Math.max(1, steps);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push({
      latitude: from.latitude + (to.latitude - from.latitude) * t,
      longitude: from.longitude + (to.longitude - from.longitude) * t,
    });
  }

  return points;
}

/**
 * Interpola una posición a lo largo de una lista de coordenadas según un progreso 0..1.
 */
export function positionAlongRoute(route: LatLng[], progress: number): LatLng | null {
  if (route.length === 0) {
    return null;
  }
  if (route.length === 1) {
    return route[0];
  }

  const clamped = Math.min(1, Math.max(0, progress));
  const totalSegments = route.length - 1;
  const exact = clamped * totalSegments;
  const index = Math.min(totalSegments - 1, Math.floor(exact));
  const localT = exact - index;

  const a = route[index];
  const b = route[index + 1];

  return {
    latitude: a.latitude + (b.latitude - a.latitude) * localT,
    longitude: a.longitude + (b.longitude - a.longitude) * localT,
  };
}
