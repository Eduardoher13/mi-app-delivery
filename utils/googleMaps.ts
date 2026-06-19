import Constants from 'expo-constants';

import { LatLng } from './decodePolyline';

const STATIC_MAP_MAX_POINTS = 40;

export function getGoogleMapsApiKey(): string {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    Constants.expoConfig?.extra?.googleMapsApiKey?.trim() ||
    ''
  );
}

export function buildMapsOpenUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function buildDirectionsOpenUrl(
  origin: LatLng,
  destination: LatLng,
): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}`
  );
}

/** Mapa embebido con tienda + destino (sin API key; funciona en iframe). */
export function buildOsmRouteEmbedUrl(
  origin: LatLng,
  destination: LatLng,
  padding = 0.02,
): string {
  const south = Math.min(origin.latitude, destination.latitude) - padding;
  const north = Math.max(origin.latitude, destination.latitude) + padding;
  const west = Math.min(origin.longitude, destination.longitude) - padding;
  const east = Math.max(origin.longitude, destination.longitude) + padding;

  const params = new URLSearchParams({
    bbox: `${west},${south},${east},${north}`,
    layer: 'mapnik',
  });

  params.append('marker', `${origin.latitude},${origin.longitude}`);
  params.append('marker', `${destination.latitude},${destination.longitude}`);

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export function buildStaticMapUrl(options: {
  width?: number;
  height?: number;
  center?: LatLng;
  zoom?: number;
  markers?: LatLng[];
  markerColors?: string[];
  path?: LatLng[];
}): string | null {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return null;
  }

  const width = options.width ?? 400;
  const height = options.height ?? 280;
  const center = options.center ?? options.markers?.[0];
  if (!center) {
    return null;
  }

  const params = new URLSearchParams({
    center: `${center.latitude},${center.longitude}`,
    zoom: String(options.zoom ?? 14),
    size: `${width}x${height}`,
    scale: '2',
    key: apiKey,
  });

  options.markers?.forEach((point, index) => {
    const color = options.markerColors?.[index] ?? 'red';
    params.append('markers', `color:${color}|${point.latitude},${point.longitude}`);
  });

  if (options.path && options.path.length > 1) {
    const step = Math.max(1, Math.ceil(options.path.length / STATIC_MAP_MAX_POINTS));
    const sampled = options.path.filter((_, index) => index % step === 0);
    const last = options.path[options.path.length - 1];
    if (sampled[sampled.length - 1] !== last) {
      sampled.push(last);
    }

    const pathValue = sampled
      .map((point) => `${point.latitude},${point.longitude}`)
      .join('|');

    params.append('path', `color:0x1e3a8aff|weight:4|${pathValue}`);
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}
