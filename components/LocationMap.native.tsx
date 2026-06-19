import { View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { MANAGUA_COORDS } from '../utils/constants';

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
  const region: Region = {
    latitude,
    longitude,
    latitudeDelta: MANAGUA_COORDS.latitudeDelta,
    longitudeDelta: MANAGUA_COORDS.longitudeDelta,
  };

  return (
    <View className="overflow-hidden rounded-xl border border-[#E2E8F0]">
      <MapView style={{ height, width: '100%' }} region={region}>
        {showMarker ? (
          <Marker coordinate={{ latitude, longitude }} title={title} pinColor="#1e3a8a" />
        ) : null}
      </MapView>
    </View>
  );
}
