import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessionalListCard } from '../../../components/ProfessionalListCard';
import { useRoleRedirect } from '../../../hooks/useRoleRedirect';
import { formatApiError } from '../../../services/api';
import {
  getAvailableProfessionals,
  getProfessionalsBySpecialty,
} from '../../../services/professionals';
import { ServiceProvider } from '../../../types';
import { CATEGORIES } from '../../../utils/constants';
import { goToProfessionalOffer } from '../../../utils/navigation';
import { isCliente } from '../../../utils/roles';

export default function ServicesScreen() {
  const router = useRouter();
  useRoleRedirect(isCliente);
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const specialtySlug =
    typeof slug === 'string' && slug.length > 0 ? slug : undefined;

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
          ? await getProfessionalsBySpecialty(specialtySlug)
          : await getAvailableProfessionals();
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

  useFocusEffect(
    useCallback(() => {
      void loadProfessionals(true);
    }, [loadProfessionals]),
  );

  const handleSelectSlug = (nextSlug?: string) => {
    router.setParams({ slug: nextSlug ?? '' });
  };

  const title = categoryName ? `Servicios — ${categoryName}` : 'Servicios';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">{title}</Text>
        <Text className="mt-1 text-sm text-[#94A3B8]">
          {!loading && !error
            ? `${professionals.length} profesional(es)`
            : specialtySlug
              ? `Profesionales de ${categoryName ?? specialtySlug}`
              : 'Profesionales disponibles cerca de ti'}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 max-h-9 flex-grow-0"
          contentContainerClassName="items-center pr-2"
        >
          <Pressable
            className={`mr-2 rounded-full border px-3 py-1 ${
              !specialtySlug
                ? 'border-[#1e3a8a] bg-[#1e3a8a]'
                : 'border-[#E2E8F0] bg-white'
            }`}
            onPress={() => handleSelectSlug()}
          >
            <Text
              className={`text-[11px] font-bold leading-4 ${
                !specialtySlug ? 'text-white' : 'text-[#0F172A]'
              }`}
            >
              Todos
            </Text>
          </Pressable>
          {CATEGORIES.map((category) => {
            const selected = specialtySlug === category.slug;

            return (
              <Pressable
                key={category.id}
                className={`mr-2 rounded-full border px-3 py-1 ${
                  selected
                    ? 'border-[#1e3a8a] bg-[#1e3a8a]'
                    : 'border-[#E2E8F0] bg-white'
                }`}
                onPress={() => handleSelectSlug(category.slug)}
              >
                <Text
                  className={`text-[11px] font-bold leading-4 ${
                    selected ? 'text-white' : 'text-[#0F172A]'
                  }`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1e3a8a" size="large" />
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
                tintColor="#1e3a8a"
              />
            }
          >
            {professionals.map((professional) => (
              <View key={professional.id} className="mb-3">
                <ProfessionalListCard
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
