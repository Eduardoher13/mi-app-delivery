import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ServiceRequest } from '../services/serviceRequests';

interface ServiceRequestInboxCardProps {
  request: ServiceRequest;
  onPress?: (request: ServiceRequest) => void;
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

export function ServiceRequestInboxCard({
  request,
  onPress,
}: ServiceRequestInboxCardProps) {
  return (
    <Pressable
      className="rounded-xl border border-[#E2E8F0] bg-white p-4"
      onPress={() => onPress?.(request)}
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

      <View className="mt-2 flex-row items-center">
        <Ionicons name="location-outline" size={12} color="#94A3B8" />
        <Text className="ml-1 flex-1 text-xs text-[#94A3B8]" numberOfLines={1}>
          {request.address}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-[#00A878]">
          {statusLabel(request.status)}
        </Text>
        <Text className="text-xs text-[#94A3B8]">{formatDate(request.created_at)}</Text>
      </View>
    </Pressable>
  );
}
