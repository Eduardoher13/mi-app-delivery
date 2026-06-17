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
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { formatApiError } from '../../services/api';
import { getOrdersForClient, Order } from '../../services/orders';
import { resolveClientId } from '../../services/serviceRequests';
import { isCliente } from '../../utils/roles';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    carrito: 'Carrito',
    pagado: 'Pagado',
    enviado: 'Enviado',
    entregado: 'Entregado',
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

export default function ClientOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useRoleRedirect(isCliente);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const clientId = await resolveClientId(user);
        const data = await getOrdersForClient(clientId);
        setOrders(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-2">
        <View className="flex-row items-center">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text className="text-lg font-black text-[#0F172A]">Mis pedidos</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00A878" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#94A3B8]">
              Aún no tienes pedidos confirmados.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            contentContainerClassName="pb-8"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadOrders(true)}
                tintColor="#00A878"
              />
            }
          >
            {orders.map((order) => {
              const total = Number.parseFloat(order.total);

              return (
                <View
                  key={order.id}
                  className="mb-3 rounded-xl border border-[#E2E8F0] bg-white p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-[#0F172A]">
                      Pedido #{order.id.slice(0, 8)}
                    </Text>
                    <Text className="text-xs font-semibold text-[#00A878]">
                      {statusLabel(order.status)}
                    </Text>
                  </View>
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-base font-black text-[#0F172A]">
                      ${Number.isFinite(total) ? total.toFixed(2) : order.total}
                    </Text>
                    <Text className="text-xs text-[#94A3B8]">
                      {formatDate(order.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
