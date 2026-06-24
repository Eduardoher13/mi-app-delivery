import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

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
  const [draftCenter, setDraftCenter] = useState<MapCoords>(initialCenter);
  const isLocked = confirmedCenter != null;

  useEffect(() => {
    if (!flyTo || isLocked) {
      return;
    }

    const region = toRegion(flyTo);
    mapRef.current?.animateToRegion(region, 450);
    setDraftCenter({ latitude: flyTo.latitude, longitude: flyTo.longitude });
  }, [flyTo?.key, flyTo?.latitude, flyTo?.longitude, isLocked]);

  useEffect(() => {
    if (!isLocked || !confirmedCenter) {
      return;
    }

    mapRef.current?.animateToRegion(toRegion(confirmedCenter), 300);
  }, [isLocked, confirmedCenter?.latitude, confirmedCenter?.longitude]);

  const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  const handleConfirm = () => {
    onConfirm(draftCenter);
  };

  const handleChange = () => {
    if (confirmedCenter) {
      setDraftCenter(confirmedCenter);
    }
    onClear?.();
  };

  return (
    <View>
      <View
        className={`overflow-hidden rounded-xl border ${
          isLocked ? 'border-[#16A34A]' : 'border-[#E2E8F0]'
        }`}
        style={{ height }}
        onStartShouldSetResponder={() => !isLocked}
        onMoveShouldSetResponder={() => !isLocked}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={toRegion(initialCenter)}
          provider={provider}
          scrollEnabled={!isLocked}
          zoomEnabled={!isLocked}
          rotateEnabled={false}
          pitchEnabled={false}
          onRegionChangeComplete={(region) => {
            if (isLocked) {
              return;
            }

            setDraftCenter({
              latitude: region.latitude,
              longitude: region.longitude,
            });
          }}
        >
          {isLocked && confirmedCenter ? (
            <Marker
              coordinate={confirmedCenter}
              title="Entrega confirmada"
              pinColor="#16A34A"
            />
          ) : null}
        </MapView>

        {!isLocked ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center"
          >
            <View className="items-center" style={{ marginBottom: 40 }}>
              <Ionicons name="location" size={40} color="#1e3a8a" />
              <View className="mt-1 h-2 w-2 rounded-full bg-[#1e3a8a]/30" />
            </View>
          </View>
        ) : null}

        {isLocked ? (
          <View
            pointerEvents="none"
            className="absolute left-2 top-2 flex-row items-center rounded-full bg-[#16A34A] px-2.5 py-1"
          >
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text className="ml-1 text-[10px] font-bold text-white">Ubicación fijada</Text>
          </View>
        ) : null}
      </View>

      <Text className="mt-2 text-center text-xs text-[#94A3B8]">
        {isLocked
          ? 'Tu ubicación quedó guardada en el mapa.'
          : 'Mueve el mapa hasta que el pin quede en tu entrada y confirma.'}
      </Text>

      {!isLocked ? (
        <Pressable
          className="mt-3 items-center rounded-xl bg-[#1e3a8a] py-3"
          onPress={handleConfirm}
        >
          <Text className="text-sm font-bold text-white">Confirmar ubicación en mapa</Text>
        </Pressable>
      ) : (
        <Pressable
          className="mt-3 items-center rounded-xl border border-[#E2E8F0] py-3"
          onPress={handleChange}
        >
          <Text className="text-sm font-bold text-[#0F172A]">Cambiar ubicación</Text>
        </Pressable>
      )}
    </View>
  );
}
