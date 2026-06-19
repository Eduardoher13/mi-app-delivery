import { createElement } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { LatLng } from '../utils/decodePolyline';
import {
  buildDirectionsOpenUrl,
  buildMapsOpenUrl,
  buildOsmRouteEmbedUrl,
} from '../utils/googleMaps';

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
  origin: LatLng;
  destination: LatLng;
  height?: number;
  fill?: boolean;
  title?: string;
}

export function WebDirectionsMap({
  origin,
  destination,
  height = 320,
  fill = false,
  title = 'Ruta de entrega',
}: WebDirectionsMapProps) {
  const embedUrl = buildOsmRouteEmbedUrl(origin, destination);
  const directionsUrl = buildDirectionsOpenUrl(origin, destination);
  const iframeHeight = fill ? '100%' : height;

  return (
    <View style={fill ? { flex: 1, width: '100%', minHeight: 300, position: 'relative' } : { position: 'relative' }}>
      <Pressable
        style={fill ? { flex: 1, width: '100%' } : undefined}
        className={fill ? undefined : 'overflow-hidden rounded-xl border border-[#E2E8F0]'}
        onPress={() => void Linking.openURL(directionsUrl)}
        accessibilityLabel={title}
      >
        {createElement('iframe', {
          title,
          src: embedUrl,
          width: '100%',
          height: iframeHeight,
          loading: 'lazy',
          referrerPolicy: 'no-referrer-when-downgrade',
          style: {
            border: 0,
            display: 'block',
            pointerEvents: 'none',
            width: '100%',
            height: iframeHeight,
            minHeight: fill ? 300 : height,
          },
        })}
      </Pressable>
      <Pressable
        className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 shadow-sm"
        onPress={() => void Linking.openURL(directionsUrl)}
      >
        <Text className="text-[10px] font-bold text-[#1e3a8a]">Abrir ruta en Google Maps</Text>
      </Pressable>
    </View>
  );
}
