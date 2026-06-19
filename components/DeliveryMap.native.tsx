import { useEffect, useRef } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import MapView, {
  MapViewProps,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

import { LatLng } from '../utils/decodePolyline';
import { MANAGUA_COORDS } from '../utils/constants';

interface DeliveryMapProps {
  pickup: LatLng;
  delivery: LatLng;
  driverPosition?: LatLng | null;
  polylineCoordinates: LatLng[];
  style?: StyleProp<ViewStyle>;
}

const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

const initialRegion: Region = {
  latitude: MANAGUA_COORDS.latitude,
  longitude: MANAGUA_COORDS.longitude,
  latitudeDelta: MANAGUA_COORDS.latitudeDelta,
  longitudeDelta: MANAGUA_COORDS.longitudeDelta,
};

export function DeliveryMap({
  pickup,
  delivery,
  driverPosition,
  polylineCoordinates,
  style,
}: DeliveryMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const coords = polylineCoordinates.length > 0 ? polylineCoordinates : [pickup, delivery];

    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [pickup, delivery, polylineCoordinates]);

  const mapProps: MapViewProps = {
    style: { flex: 1 },
    initialRegion,
  };

  if (provider) {
    mapProps.provider = provider;
  }

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <MapView ref={mapRef} {...mapProps}>
        {polylineCoordinates.length > 1 ? (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#1e3a8a"
            strokeWidth={4}
          />
        ) : null}

        <Marker coordinate={pickup} title="Tienda" pinColor="#1e3a8a" />
        <Marker coordinate={delivery} title="Tu dirección" pinColor="#EF4444" />

        {driverPosition ? (
          <Marker coordinate={driverPosition} title="Repartidor" pinColor="#1e3a8a" />
        ) : null}
      </MapView>
    </View>
  );
}
