import { createElement } from 'react';
import { Linking, Pressable } from 'react-native';

import { buildMapsOpenUrl } from '../utils/googleMaps';

interface WebMapViewProps {
  latitude: number;
  longitude: number;
  height?: number;
  zoom?: number;
  title?: string;
}

/** Mapa embebido en web sin Maps Static API (evita imagen en blanco por restricciones de clave). */
export function WebMapView({
  latitude,
  longitude,
  height = 180,
  zoom = 15,
  title = 'Mapa',
}: WebMapViewProps) {
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=es&z=${zoom}&output=embed`;

  return (
    <Pressable
      className="overflow-hidden rounded-xl border border-[#E2E8F0]"
      onPress={() => void Linking.openURL(buildMapsOpenUrl(latitude, longitude))}
      accessibilityLabel={title}
    >
      {createElement('iframe', {
        title,
        src: embedUrl,
        width: '100%',
        height,
        loading: 'lazy',
        referrerPolicy: 'no-referrer-when-downgrade',
        style: {
          border: 0,
          display: 'block',
          pointerEvents: 'none',
        },
      })}
    </Pressable>
  );
}

interface WebDirectionsMapProps {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  height?: number;
  title?: string;
}

export function WebDirectionsMap({
  origin,
  destination,
  height = 320,
  title = 'Ruta de entrega',
}: WebDirectionsMapProps) {
  const embedUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&hl=es&output=embed`;

  return (
    <Pressable
      className="overflow-hidden rounded-xl border border-[#E2E8F0]"
      onPress={() =>
        void Linking.openURL(buildMapsOpenUrl(destination.latitude, destination.longitude))
      }
      accessibilityLabel={title}
    >
      {createElement('iframe', {
        title,
        src: embedUrl,
        width: '100%',
        height,
        loading: 'lazy',
        referrerPolicy: 'no-referrer-when-downgrade',
        style: {
          border: 0,
          display: 'block',
          pointerEvents: 'none',
        },
      })}
    </Pressable>
  );
}
