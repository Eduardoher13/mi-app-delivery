import MapView, { Marker, Region } from 'react-native-maps';
import { ActivityIndicator, Text, View } from 'react-native';

import { MANAGUA_COORDS } from '../utils/constants';

interface MapPreviewProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  loading?: boolean;
}

export function MapPreview({
  latitude = MANAGUA_COORDS.latitude,
  longitude = MANAGUA_COORDS.longitude,
  title = 'Managua, Nicaragua',
  loading = false,
}: MapPreviewProps) {
  const region: Region = {
    latitude,
    longitude,
    latitudeDelta: MANAGUA_COORDS.latitudeDelta,
    longitudeDelta: MANAGUA_COORDS.longitudeDelta,
  };

  if (loading) {
    return (
      <View className="h-48 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#E2E8F0]">
        <ActivityIndicator color="#00A878" />
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-xl border border-[#E2E8F0]">
      <MapView style={{ height: 192, width: '100%' }} region={region}>
        <Marker coordinate={{ latitude, longitude }} title={title} />
      </MapView>
    </View>
  );
}
