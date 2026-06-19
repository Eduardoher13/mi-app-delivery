import { Image, Linking, Pressable, StyleProp, Text, ViewStyle } from 'react-native';

import { LatLng } from '../utils/decodePolyline';
import { buildMapsOpenUrl, buildStaticMapUrl } from '../utils/googleMaps';

interface DeliveryMapProps {
  pickup: LatLng;
  delivery: LatLng;
  driverPosition?: LatLng | null;
  polylineCoordinates: LatLng[];
  style?: StyleProp<ViewStyle>;
}

export function DeliveryMap({
  pickup,
  delivery,
  driverPosition,
  polylineCoordinates,
  style,
}: DeliveryMapProps) {
  const markers = [pickup, delivery];
  const markerColors = ['0x1e3a8a', 'red'];

  if (driverPosition) {
    markers.push(driverPosition);
    markerColors.push('blue');
  }

  const mapHeight =
    typeof style === 'object' && style && 'height' in style ? Number(style.height) : 320;

  const staticUrl = buildStaticMapUrl({
    width: 430,
    height: mapHeight,
    center: delivery,
    zoom: 13,
    markers,
    markerColors,
    path: polylineCoordinates.length > 1 ? polylineCoordinates : [pickup, delivery],
  });

  if (staticUrl) {
    return (
      <Pressable
        style={[{ overflow: 'hidden' }, style]}
        onPress={() => void Linking.openURL(buildMapsOpenUrl(delivery.latitude, delivery.longitude))}
      >
        <Image
          source={{ uri: staticUrl }}
          style={{ width: '100%', height: mapHeight }}
          resizeMode="cover"
          accessibilityLabel="Mapa de entrega"
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        {
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
        },
        style,
      ]}
      onPress={() => void Linking.openURL(buildMapsOpenUrl(delivery.latitude, delivery.longitude))}
    >
      <Text className="text-sm font-semibold text-[#1e3a8a]">Ver ruta en Google Maps</Text>
      <Text className="mt-1 px-4 text-center text-xs text-[#94A3B8]">Tienda → tu dirección</Text>
    </Pressable>
  );
}
