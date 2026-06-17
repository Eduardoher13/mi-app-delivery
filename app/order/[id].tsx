import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { getDefaultTabHref, isCliente } from '../../utils/roles';

function parseStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function OrderSuccessScreen() {
  const router = useRouter();
  useRoleRedirect(isCliente);

  const params = useLocalSearchParams<{
    id: string;
    total?: string;
    status?: string;
  }>();

  const orderId = parseStringParam(params.id);
  const total = Number.parseFloat(parseStringParam(params.total));
  const status = parseStringParam(params.status) || 'pagado';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#00A878]/10">
          <Ionicons name="checkmark-circle" size={48} color="#00A878" />
        </View>
        <Text className="text-center text-xl font-black text-[#0F172A]">
          Pedido confirmado
        </Text>
        <Text className="mt-2 text-center text-sm text-[#94A3B8]">
          #{orderId.slice(0, 8)}… · {status}
        </Text>
        <Text className="mt-4 text-3xl font-black text-[#00A878]">
          ${Number.isFinite(total) ? total.toFixed(2) : '—'}
        </Text>
        <Text className="mt-1 text-xs text-[#94A3B8]">Total pagado (simulado)</Text>

        <Pressable
          className="mt-8 w-full items-center rounded-xl bg-[#00A878] py-4"
          onPress={() => router.replace(getDefaultTabHref('cliente'))}
        >
          <Text className="text-sm font-bold text-white">Volver al inicio</Text>
        </Pressable>
        <Pressable
          className="mt-3 w-full items-center rounded-xl border border-[#E2E8F0] py-4"
          onPress={() => router.replace('/orders')}
        >
          <Text className="text-sm font-bold text-[#0F172A]">Ver mis pedidos</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
