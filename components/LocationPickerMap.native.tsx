import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import {
  LocationPickerMapProps,
  MAP_PICKER_DELTA,
  MapCoords,
} from './LocationPickerMap.types';

function toRegion(center: MapCoords): Region {
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: MAP_PICKER_DELTA,
    longitudeDelta: MAP_PICKER_DELTA,
  };
}

export function LocationPickerMap({
  height = 220,
  initialCenter,
  flyTo,
  confirmedCenter,
  onConfirm,
  onClear,
}: LocationPickerMapProps) {
  const mapRef = useRef<MapView>(null);
  const [center, setCenter] = useState<MapCoords>(initialCenter);
  const pinMatchesSaved =
    confirmedCenter != null &&
    Math.abs(confirmedCenter.latitude - center.latitude) < 0.00001 &&
    Math.abs(confirmedCenter.longitude - center.longitude) < 0.00001;

  useEffect(() => {
    if (!flyTo) {
      return;
    }

    const region = toRegion(flyTo);
    mapRef.current?.animateToRegion(region, 450);
    setCenter({ latitude: flyTo.latitude, longitude: flyTo.longitude });
  }, [flyTo?.key, flyTo?.latitude, flyTo?.longitude]);

  const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  return (
    <View>
      <View
        className="overflow-hidden rounded-xl border border-[#E2E8F0]"
        style={{ height }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={toRegion(initialCenter)}
          provider={provider}
          onRegionChangeComplete={(region) => {
            setCenter({
              latitude: region.latitude,
              longitude: region.longitude,
            });
          }}
        />
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <Ionicons
            name="location"
            size={40}
            color={pinMatchesSaved ? '#16A34A' : '#1e3a8a'}
            style={{ marginBottom: 40 }}
          />
        </View>
      </View>

      <Text className="mt-2 text-center text-xs text-[#94A3B8]">
        Mueve el mapa hasta que el pin quede en tu entrada
      </Text>

      <Pressable
        className="mt-3 items-center rounded-xl bg-[#1e3a8a] py-3"
        onPress={() => onConfirm(center)}
      >
        <Text className="text-sm font-bold text-white">Confirmar ubicación en mapa</Text>
      </Pressable>

      {confirmedCenter ? (
        <View className="mt-2 flex-row items-center justify-between rounded-lg bg-[#F0FDF4] px-3 py-2">
          <View className="flex-1 flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text className="ml-2 text-xs font-semibold text-[#166534]">
              {pinMatchesSaved ? 'Ubicación guardada' : 'Confirma de nuevo si moviste el mapa'}
            </Text>
          </View>
          {onClear ? (
            <Pressable onPress={onClear} hitSlop={8}>
              <Text className="text-xs font-semibold text-[#94A3B8]">Quitar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
