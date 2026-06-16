import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceRequestCard } from '../../../components/ServiceRequestCard';
import { formatApiError } from '../../../services/api';
import {
  getAvailableProfessionals,
  getProfessionalsBySpecialty,
} from '../../../services/professionals';
import { ServiceProvider } from '../../../types';
import { CATEGORIES } from '../../../utils/constants';
import { goToProfessionalOffer } from '../../../utils/navigation';

export default function ServicesScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const specialtySlug = typeof slug === 'string' ? slug : undefined;

  const categoryName = useMemo(() => {
    if (!specialtySlug) {
      return null;
    }

    return CATEGORIES.find((category) => category.slug === specialtySlug)?.name;
  }, [specialtySlug]);

  const [professionals, setProfessionals] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfessionals = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = specialtySlug
          ? await getProfessionalsBySpecialty(specialtySlug, { limit: 20 })
          : await getAvailableProfessionals({ limit: 20 });
        setProfessionals(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [specialtySlug],
  );

  useEffect(() => {
    void loadProfessionals();
  }, [loadProfessionals]);

  const title = categoryName
    ? `Servicios — ${categoryName}`
    : 'Servicios';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">{title}</Text>
        <Text className="mt-1 text-sm text-[#94A3B8]">
          {specialtySlug
            ? `Profesionales de ${categoryName ?? specialtySlug}`
            : 'Profesionales disponibles cerca de ti'}
        </Text>

        {/* Fase 3: filtros, detalle, solicitar servicio */}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00A878" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
          </View>
        ) : professionals.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#94A3B8]">
              {specialtySlug
                ? `No hay profesionales de ${categoryName ?? specialtySlug} disponibles`
                : 'No hay profesionales disponibles en este momento'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            contentContainerClassName="pb-8"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadProfessionals(true)}
                tintColor="#00A878"
              />
            }
          >
            {professionals.map((professional) => (
              <View key={professional.id} className="mb-3">
                <ServiceRequestCard
                  service={professional}
                  onPress={(item) => goToProfessionalOffer(router, item)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
