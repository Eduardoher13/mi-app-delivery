import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { formatApiError } from '../../services/api';
import {
  getServiceRequestsForClient,
  resolveClientId,
  ServiceRequest,
} from '../../services/serviceRequests';
import { goToNewServiceRequest } from '../../utils/navigation';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleDateString('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };

  return labels[status] ?? status;
}

export default function ServiceRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const clientId = await resolveClientId(user);

        const data = await getServiceRequestsForClient(clientId, { limit: 50 });
        setRequests(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </Pressable>
            <Text className="text-lg font-black text-[#0F172A]">Mis solicitudes</Text>
          </View>
          <Pressable
            className="rounded-lg bg-[#00A878] px-3 py-2"
            onPress={() => goToNewServiceRequest(router)}
          >
            <Text className="text-xs font-bold text-white">Nueva</Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00A878" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
          </View>
        ) : requests.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#94A3B8]">
              Aún no tienes solicitudes de servicio.
            </Text>
            <Pressable
              className="mt-4 rounded-xl bg-[#00A878] px-6 py-3"
              onPress={() => goToNewServiceRequest(router)}
            >
              <Text className="text-sm font-bold text-white">Crear solicitud</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            contentContainerClassName="pb-8"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadRequests(true)}
                tintColor="#00A878"
              />
            }
          >
            {requests.map((request) => (
              <View
                key={request.id}
                className="mb-3 rounded-xl border border-[#E2E8F0] bg-white p-4"
              >
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-sm font-bold text-[#0F172A]">
                    {request.title}
                  </Text>
                  {request.is_emergency ? (
                    <View className="rounded-full bg-red-100 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-red-600">URGENTE</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="mt-1 text-xs text-[#94A3B8]" numberOfLines={2}>
                  {request.description}
                </Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-[#00A878]">
                    {statusLabel(request.status)}
                  </Text>
                  <Text className="text-xs text-[#94A3B8]">
                    {formatDate(request.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
