import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, Pressable, Text } from 'react-native';

import { buildMapsOpenUrl, buildStaticMapUrl } from '../utils/googleMaps';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  height?: number;
  title?: string;
  showMarker?: boolean;
}

export function LocationMap({
  latitude,
  longitude,
  height = 180,
  title = 'Ubicación',
  showMarker = true,
}: LocationMapProps) {
  const staticUrl = buildStaticMapUrl({
    width: 430,
    height,
    center: { latitude, longitude },
    zoom: 15,
    markers: showMarker ? [{ latitude, longitude }] : undefined,
    markerColors: ['0x1e3a8a'],
  });

  if (staticUrl) {
    return (
      <Pressable
        className="overflow-hidden rounded-xl border border-[#E2E8F0]"
        onPress={() => void Linking.openURL(buildMapsOpenUrl(latitude, longitude))}
      >
        <Image
          source={{ uri: staticUrl }}
          style={{ width: '100%', height }}
          resizeMode="cover"
          accessibilityLabel={title}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      className="items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4"
      style={{ height }}
      onPress={() => void Linking.openURL(buildMapsOpenUrl(latitude, longitude))}
    >
      <Ionicons name="map-outline" size={28} color="#1e3a8a" />
      <Text className="mt-2 text-center text-xs font-semibold text-[#1e3a8a]">
        Abrir en Google Maps
      </Text>
      <Text className="mt-1 text-center text-[10px] text-[#94A3B8]">
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
    </Pressable>
  );
}
