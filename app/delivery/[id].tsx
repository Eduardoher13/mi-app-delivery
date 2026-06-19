import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeliveryMap } from '../../components/DeliveryMap';
import { useDeliveryTracking } from '../../hooks/useDeliveryTracking';
import { formatApiError } from '../../services/api';
import {
  Delivery,
  getDeliveryById,
  updateDelivery,
} from '../../services/deliveries';
import { DELIVERY_PICKUP_COORDS, MANAGUA_COORDS } from '../../utils/constants';
import { decodePolyline, LatLng } from '../../utils/decodePolyline';
import { buildStraightRoute } from '../../utils/deliveryRoute';

function parseStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function toCoord(
  lat: string | number | null,
  lng: string | number | null,
  fallback: LatLng,
): LatLng {
  const latitude = lat === null ? NaN : Number(lat);
  const longitude = lng === null ? NaN : Number(lng);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }
  return fallback;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_camino: 'En camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return labels[status] ?? status;
}

function etaLabel(durationSeconds: number | string | null): string {
  const seconds = Number(durationSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '—';
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes} min aprox.`;
}

function formatRef(id?: string | null): string {
  return id ? id.slice(0, 8) : '—';
}

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const deliveryId = parseStringParam(params.id);

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    if (!deliveryId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getDeliveryById(deliveryId);
      setDelivery(data);
    } catch (err) {
      setError(formatApiError(err, 'No se pudo cargar la entrega'));
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const routeRef = useRef<LatLng[]>([]);

  const pickup = useMemo(
    () =>
      delivery
        ? toCoord(delivery.pickup_lat, delivery.pickup_lng, DELIVERY_PICKUP_COORDS)
        : DELIVERY_PICKUP_COORDS,
    [delivery],
  );

  const dropoff = useMemo(
    () =>
      delivery
        ? toCoord(delivery.delivery_lat, delivery.delivery_lng, {
            latitude: MANAGUA_COORDS.latitude,
            longitude: MANAGUA_COORDS.longitude,
          })
        : {
            latitude: MANAGUA_COORDS.latitude,
            longitude: MANAGUA_COORDS.longitude,
          },
    [delivery],
  );

  const route = useMemo(() => {
    const decoded = decodePolyline(delivery?.polyline_encoded);
    if (decoded.length > 1) {
      return decoded;
    }
    if (routeRef.current.length > 1) {
      return routeRef.current;
    }
    return buildStraightRoute(pickup, dropoff, 20);
  }, [delivery?.polyline_encoded, pickup, dropoff]);

  useEffect(() => {
    if (route.length > 1) {
      routeRef.current = route;
    }
  }, [route]);

  const isDelivered = delivery?.status === 'entregado';

  const { driverPosition, progress, arrived } = useDeliveryTracking({
    deliveryId,
    route: routeRef.current.length > 1 ? routeRef.current : route,
    enabled: Boolean(delivery) && !isDelivered,
    postPings: true,
  });

  const displayDriverPosition = isDelivered ? dropoff : driverPosition;

  const handleComplete = async () => {
    if (!delivery) {
      return;
    }
    setCompleting(true);
    try {
      const updated = await updateDelivery(delivery.id, {
        status: 'entregado',
      });
      setDelivery((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status,
              completed_at: updated.completed_at ?? prev.completed_at,
              order_id: updated.order_id || prev.order_id,
            }
          : updated,
      );
    } catch (err) {
      setError(formatApiError(err, 'No se pudo completar la entrega'));
    } finally {
      setCompleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center px-4 pt-2">
        <Pressable
          className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>
        <Text className="text-lg font-black text-[#0F172A]">Seguir entrega</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1e3a8a" size="large" />
        </View>
      ) : error || !delivery ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-[#0F172A]">
            {error ?? 'Entrega no encontrada.'}
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <View className="flex-1">
            <DeliveryMap
              pickup={pickup}
              delivery={dropoff}
              driverPosition={displayDriverPosition}
              polylineCoordinates={routeRef.current.length > 1 ? routeRef.current : route}
              style={{ flex: 1 }}
            />
          </View>

          <View className="border-t border-[#E2E8F0] px-4 pb-8 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-black text-[#0F172A]">
                Pedido #{formatRef(delivery.order_id || delivery.id)}
              </Text>
              <View
                className={`rounded-full px-3 py-1 ${
                  isDelivered ? 'bg-[#1e3a8a]/10' : 'bg-[#1e3a8a]/10'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isDelivered ? 'text-[#1e3a8a]' : 'text-[#1e3a8a]'
                  }`}
                >
                  {statusLabel(delivery.status)}
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-start">
              <Ionicons name="storefront-outline" size={16} color="#1e3a8a" />
              <Text className="ml-2 flex-1 text-sm text-[#0F172A]" numberOfLines={1}>
                {delivery.pickup_address}
              </Text>
            </View>
            <View className="mt-1.5 flex-row items-start">
              <Ionicons name="home-outline" size={16} color="#EF4444" />
              <Text className="ml-2 flex-1 text-sm text-[#0F172A]" numberOfLines={1}>
                {delivery.delivery_address}
              </Text>
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-[#94A3B8]">ETA estimado</Text>
              <Text className="text-sm font-bold text-[#0F172A]">
                {isDelivered ? 'Entregado' : etaLabel(delivery.duration_seconds)}
              </Text>
            </View>

            {!isDelivered ? (
              <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                <View
                  className="h-full rounded-full bg-[#1e3a8a]"
                  style={{ width: `${Math.round((arrived ? 1 : progress) * 100)}%` }}
                />
              </View>
            ) : null}

            {!isDelivered ? (
              <Pressable
                className="mt-4 items-center rounded-xl bg-[#1e3a8a] py-4"
                onPress={() => void handleComplete()}
                disabled={completing}
              >
                {completing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    Simular entrega completa
                  </Text>
                )}
              </Pressable>
            ) : (
              <View className="mt-4 flex-row items-center justify-center rounded-xl bg-[#1e3a8a]/10 py-4">
                <Ionicons name="checkmark-circle" size={18} color="#1e3a8a" />
                <Text className="ml-2 text-sm font-bold text-[#1e3a8a]">
                  Entrega completada
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
