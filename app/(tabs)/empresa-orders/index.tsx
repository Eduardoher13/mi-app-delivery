import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderInboxCard } from '../../../components/OrderInboxCard';
import { useAuth } from '../../../contexts/AuthContext';
import { useRoleRedirect } from '../../../hooks/useRoleRedirect';
import { formatApiError } from '../../../services/api';
import { CompanyOrderPreview, getOrdersForCompany } from '../../../services/orders';
import { getCompanyByUserId } from '../../../services/products';
import { isEmpresa } from '../../../utils/roles';

export default function EmpresaOrdersScreen() {
  const { user } = useAuth();
  useRoleRedirect(isEmpresa);
  const [orders, setOrders] = useState<CompanyOrderPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) {
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const company = await getCompanyByUserId(user.id);
        const data = await getOrdersForCompany(company.id);
        setOrders(data);
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
    void loadOrders();
  }, [loadOrders]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">Pedidos de clientes</Text>
        <Text className="mt-1 text-sm text-[#94A3B8]">
          {!loading && !error
            ? `${orders.length} pedido(s) con productos de tu ferretería`
            : 'Vista previa — carrito completo en Fase 5'}
        </Text>

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
              Cuando un cliente compre productos de tu ferretería, aparecerán aquí (Fase 5)
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
            {orders.map((preview) => (
              <View key={preview.order.id} className="mb-3">
                <OrderInboxCard preview={preview} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
