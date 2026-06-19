import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceRequestFilterChips } from '../../../components/ServiceRequestFilterChips';
import { ServiceRequestInboxCard } from '../../../components/ServiceRequestInboxCard';
import { useAuth } from '../../../contexts/AuthContext';
import { useRoleRedirect } from '../../../hooks/useRoleRedirect';
import { formatApiError } from '../../../services/api';
import { getSpecialtyIdsByProfessional } from '../../../services/professionalSpecialties';
import { getProfessionalByUserId } from '../../../services/professionals';
import {
  getServiceRequestsForProfessional,
  ServiceRequest,
} from '../../../services/serviceRequests';
import { isProfesional } from '../../../utils/roles';
import {
  matchesServiceRequestFilter,
  ServiceRequestFilter,
} from '../../../utils/serviceRequestStatus';

export default function ProRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useRoleRedirect(isProfesional);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<ServiceRequestFilter>('pendiente');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(
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
        const professional = await getProfessionalByUserId(user.id);
        const specialtyIds = await getSpecialtyIdsByProfessional(professional.id);
        const data = await getServiceRequestsForProfessional(specialtyIds, { limit: 50 });
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

  const filteredRequests = requests.filter((request) =>
    matchesServiceRequestFilter(request.status, filter),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">Solicitudes</Text>
        <Text className="mt-1 text-sm text-[#94A3B8]">
          {!loading && !error
            ? `${filteredRequests.length} de ${requests.length} solicitud(es)`
            : 'Pedidos de clientes en tus especialidades'}
        </Text>

        {!loading && !error && requests.length > 0 ? (
          <ServiceRequestFilterChips
            value={filter}
            onChange={setFilter}
            className="mt-2"
          />
        ) : null}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1e3a8a" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#94A3B8]">
              {requests.length === 0
                ? 'No hay solicitudes en tus categorías'
                : 'No hay solicitudes en este filtro.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="mt-2 flex-1"
            contentContainerClassName="pb-8"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadRequests(true)}
                tintColor="#1e3a8a"
              />
            }
          >
            {filteredRequests.map((request) => (
              <View key={request.id} className="mb-3">
                <ServiceRequestInboxCard
                  request={request}
                  onPress={(item) =>
                    router.push({
                      pathname: '/pro-request/[id]',
                      params: { id: item.id },
                    })
                  }
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
