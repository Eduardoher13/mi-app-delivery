import { ActivityIndicator, View } from 'react-native';

import { LocationMap } from './LocationMap';
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
  if (loading) {
    return (
      <View className="h-48 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#E2E8F0]">
        <ActivityIndicator color="#1e3a8a" />
      </View>
    );
  }

  return (
    <LocationMap
      latitude={latitude}
      longitude={longitude}
      height={192}
      title={title}
    />
  );
}
