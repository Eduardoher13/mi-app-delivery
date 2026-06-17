import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatApiError } from '../../services/api';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { getServiceRequestById, ServiceRequest } from '../../services/serviceRequests';
import { isProfesional } from '../../utils/roles';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };

  return labels[status] ?? status;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProRequestDetailScreen() {
  const router = useRouter();
  useRoleRedirect(isProfesional);
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = typeof id === 'string' ? id : '';

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getServiceRequestById(requestId);
        setRequest(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [requestId]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-10 pt-2">
        <View className="flex-row items-center">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text className="text-lg font-black text-[#0F172A]">Detalle solicitud</Text>
        </View>

        {loading ? (
          <View className="my-10 items-center">
            <ActivityIndicator color="#00A878" size="large" />
          </View>
        ) : error ? (
          <Text className="my-10 text-center text-sm text-red-600">{error}</Text>
        ) : request ? (
          <View className="mt-6">
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 text-xl font-black text-[#0F172A]">
                {request.title}
              </Text>
              {request.is_emergency ? (
                <View className="rounded-full bg-red-100 px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-red-600">URGENTE</Text>
                </View>
              ) : null}
            </View>

            <Text className="mt-2 text-sm font-semibold text-[#00A878]">
              {statusLabel(request.status)}
            </Text>
            <Text className="mt-1 text-xs text-[#94A3B8]">
              {formatDate(request.created_at)}
            </Text>

            <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                DESCRIPCIÓN
              </Text>
              <Text className="mt-2 text-sm leading-5 text-[#0F172A]">
                {request.description}
              </Text>
            </View>

            <View className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
              <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                DIRECCIÓN
              </Text>
              <Text className="mt-2 text-sm text-[#0F172A]">{request.address}</Text>
            </View>

            <Pressable className="mt-6 items-center rounded-xl border border-[#E2E8F0] py-4" disabled>
              <Text className="text-sm font-bold text-[#94A3B8]">
                Enviar cotización — Fase 6A
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
