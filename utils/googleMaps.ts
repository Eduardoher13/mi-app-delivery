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
