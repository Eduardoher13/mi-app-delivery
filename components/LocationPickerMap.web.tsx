import { Ionicons } from '@expo/vector-icons';
import { createElement, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { getGoogleMaps, loadGoogleMapsScript } from '../utils/loadGoogleMaps';
import {
  LocationPickerMapProps,
  MAP_PICKER_DELTA,
  MapCoords,
} from './LocationPickerMap.types';

function zoomFromDelta(delta: number): number {
  return Math.round(Math.log2(360 / delta));
}

export function LocationPickerMap({
  height = 220,
  initialCenter,
  flyTo,
  confirmedCenter,
  onConfirm,
  onClear,
}: LocationPickerMapProps) {
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState<MapCoords>(initialCenter);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const pinMatchesSaved =
    confirmedCenter != null &&
    Math.abs(confirmedCenter.latitude - center.latitude) < 0.00001 &&
    Math.abs(confirmedCenter.longitude - center.longitude) < 0.00001;

  useEffect(() => {
    let cancelled = false;

    void loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !mapHostRef.current) {
          return;
        }

        const maps = getGoogleMaps();
        if (!maps) {
          throw new Error('Google Maps no disponible.');
        }

        const map = new maps.Map(mapHostRef.current, {
          center: { lat: initialCenter.latitude, lng: initialCenter.longitude },
          zoom: zoomFromDelta(MAP_PICKER_DELTA),
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });

        map.addListener('idle', () => {
          const mapCenter = map.getCenter();
          if (!mapCenter) {
            return;
          }

          setCenter({
            latitude: mapCenter.lat(),
            longitude: mapCenter.lng(),
          });
        });

        mapRef.current = map;
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'No se pudo cargar el mapa.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
    };
  }, [initialCenter.latitude, initialCenter.longitude]);

  useEffect(() => {
    if (!flyTo || !mapRef.current) {
      return;
    }

    mapRef.current.panTo({ lat: flyTo.latitude, lng: flyTo.longitude });
    setCenter({ latitude: flyTo.latitude, longitude: flyTo.longitude });
  }, [flyTo?.key, flyTo?.latitude, flyTo?.longitude]);

  return (
    <View>
      <View
        className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
        style={{ height, position: 'relative' }}
      >
        {loading ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-[#F8FAFC]">
            <ActivityIndicator color="#1e3a8a" />
          </View>
        ) : null}

        {loadError ? (
          <View className="absolute inset-0 z-10 items-center justify-center px-4 bg-[#F8FAFC]">
            <Text className="text-center text-xs text-red-600">{loadError}</Text>
          </View>
        ) : null}

        {createElement('div', {
          ref: mapHostRef,
          style: {
            width: '100%',
            height: '100%',
            visibility: loading || loadError ? 'hidden' : 'visible',
          },
        })}

        {!loading && !loadError ? (
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
        ) : null}
      </View>

      <Text className="mt-2 text-center text-xs text-[#94A3B8]">
        Mueve el mapa hasta que el pin quede en tu entrada
      </Text>

      <Pressable
        className="mt-3 items-center rounded-xl bg-[#1e3a8a] py-3"
        onPress={() => onConfirm(center)}
        disabled={Boolean(loadError)}
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
