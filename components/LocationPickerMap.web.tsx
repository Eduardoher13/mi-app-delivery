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
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [draftCenter, setDraftCenter] = useState<MapCoords>(initialCenter);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isLocked = confirmedCenter != null;

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
          zoomControl: !isLocked,
          gestureHandling: isLocked ? 'none' : 'greedy',
        });

        map.addListener('idle', () => {
          if (isLocked) {
            return;
          }

          const mapCenter = map.getCenter();
          if (!mapCenter) {
            return;
          }

          setDraftCenter({
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
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [initialCenter.latitude, initialCenter.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = getGoogleMaps();
    if (!map || !maps) {
      return;
    }

    map.setOptions({
      gestureHandling: isLocked ? 'none' : 'greedy',
      zoomControl: !isLocked,
      draggable: !isLocked,
      scrollwheel: !isLocked,
      disableDoubleClickZoom: isLocked,
    });

    if (isLocked && confirmedCenter) {
      map.panTo({ lat: confirmedCenter.latitude, lng: confirmedCenter.longitude });

      if (!markerRef.current) {
        markerRef.current = new maps.Marker({
          map,
          position: {
            lat: confirmedCenter.latitude,
            lng: confirmedCenter.longitude,
          },
          title: 'Entrega confirmada',
        });
      } else {
        markerRef.current.setPosition({
          lat: confirmedCenter.latitude,
          lng: confirmedCenter.longitude,
        });
        markerRef.current.setMap(map);
      }
      return;
    }

    markerRef.current?.setMap(null);
  }, [isLocked, confirmedCenter?.latitude, confirmedCenter?.longitude]);

  useEffect(() => {
    if (!flyTo || !mapRef.current || isLocked) {
      return;
    }

    mapRef.current.panTo({ lat: flyTo.latitude, lng: flyTo.longitude });
    setDraftCenter({ latitude: flyTo.latitude, longitude: flyTo.longitude });
  }, [flyTo?.key, flyTo?.latitude, flyTo?.longitude, isLocked]);

  const handleConfirm = () => {
    onConfirm(draftCenter);
  };

  const handleChange = () => {
    if (confirmedCenter) {
      setDraftCenter(confirmedCenter);
      mapRef.current?.panTo({
        lat: confirmedCenter.latitude,
        lng: confirmedCenter.longitude,
      });
    }
    onClear?.();
  };

  return (
    <View>
      <View
        className={`overflow-hidden rounded-xl border ${
          isLocked ? 'border-[#16A34A]' : 'border-[#E2E8F0]'
        } bg-[#F8FAFC]`}
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

        {!loading && !loadError && !isLocked ? (
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
            className="absolute left-2 top-2 z-10 flex-row items-center rounded-full bg-[#16A34A] px-2.5 py-1"
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
          disabled={Boolean(loadError)}
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
