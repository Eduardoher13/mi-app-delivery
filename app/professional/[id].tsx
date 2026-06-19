import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatApiError } from '../../services/api';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { getPrimarySpecialtySlugByProfessional } from '../../services/professionalSpecialties';
import { getProfessionalById } from '../../services/professionals';
import { ServiceProviderDetail } from '../../types';
import { goToNewServiceRequest } from '../../utils/navigation';
import { isCliente } from '../../utils/roles';

function parseStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function ProfessionalOfferScreen() {
  const router = useRouter();
  useRoleRedirect(isCliente);
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    role?: string;
    rating?: string;
    price?: string;
    imageUrl?: string;
    specialtySlug?: string;
  }>();

  const professionalId = parseStringParam(params.id);
  const paramSpecialtySlug = parseStringParam(params.specialtySlug) || undefined;

  const [detail, setDetail] = useState<ServiceProviderDetail | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState<string | undefined>(paramSpecialtySlug);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadProfessional = useCallback(async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const slugFromApi =
        paramSpecialtySlug ??
        (await getPrimarySpecialtySlugByProfessional(professionalId)) ??
        undefined;

      if (slugFromApi) {
        setResolvedSlug(slugFromApi);
      }

      const data = await getProfessionalById(professionalId, slugFromApi);
      setDetail(data);
    } catch (err) {
      setFetchError(formatApiError(err));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [professionalId, paramSpecialtySlug]);

  useFocusEffect(
    useCallback(() => {
      void loadProfessional();
    }, [loadProfessional]),
  );

  const name = detail?.name ?? 'Profesional';
  const role = detail?.role ?? 'Servicio verificado';
  const rating = detail?.rating ?? 0;
  const price = detail?.price ?? 0;
  const imageUrl =
    detail?.imageUrl ?? `https://picsum.photos/seed/pro-${professionalId}/400/400`;
  const specialtySlug = detail?.specialtySlug ?? resolvedSlug ?? paramSpecialtySlug;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        {loading ? (
          <View className="my-10 items-center justify-center">
            <ActivityIndicator color="#1e3a8a" size="large" />
          </View>
        ) : null}

        <Image
          source={{ uri: imageUrl }}
          className="h-56 w-full"
          resizeMode="cover"
        />

        <View className="px-4 pt-5">
          <Text className="text-2xl font-black text-[#0F172A]">{name}</Text>
          <Text className="mt-1 text-sm text-[#94A3B8]">{role}</Text>

          {fetchError ? (
            <Text className="mt-2 text-xs text-[#94A3B8]">
              Mostrando datos básicos — {fetchError}
            </Text>
          ) : null}

          <View className="mt-4 flex-row items-center">
            <Ionicons name="star" size={18} color="#1e3a8a" />
            <Text className="ml-1 text-base font-bold text-[#0F172A]">
              {Number.isFinite(rating) ? rating.toFixed(1) : '—'}
            </Text>
            <Text className="ml-2 text-sm text-[#94A3B8]">valoración promedio</Text>
          </View>

          {detail ? (
            <View className="mt-6">
              {detail.bio ? (
                <View className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                    SOBRE EL PROFESIONAL
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-[#0F172A]">{detail.bio}</Text>
                </View>
              ) : null}

              <View className="mt-3 flex-row flex-wrap">
                <View className="mb-3 mr-3 min-w-[45%] flex-1 rounded-xl border border-[#E2E8F0] p-3">
                  <Text className="text-[10px] font-semibold tracking-widest text-[#94A3B8]">
                    EXPERIENCIA
                  </Text>
                  <Text className="mt-1 text-base font-bold text-[#0F172A]">
                    {detail.yearsExperience} años
                  </Text>
                </View>
                <View className="mb-3 min-w-[45%] flex-1 rounded-xl border border-[#E2E8F0] p-3">
                  <Text className="text-[10px] font-semibold tracking-widest text-[#94A3B8]">
                    RESEÑAS
                  </Text>
                  <Text className="mt-1 text-base font-bold text-[#0F172A]">
                    {detail.totalReviews}
                  </Text>
                </View>
                <View className="mb-3 mr-3 min-w-[45%] flex-1 rounded-xl border border-[#E2E8F0] p-3">
                  <Text className="text-[10px] font-semibold tracking-widest text-[#94A3B8]">
                    RADIO DE SERVICIO
                  </Text>
                  <Text className="mt-1 text-base font-bold text-[#0F172A]">
                    {detail.serviceRadiusKm} km
                  </Text>
                </View>
                <View className="mb-3 min-w-[45%] flex-1 rounded-xl border border-[#E2E8F0] p-3">
                  <Text className="text-[10px] font-semibold tracking-widest text-[#94A3B8]">
                    DISPONIBILIDAD
                  </Text>
                  <Text className="mt-1 text-base font-bold text-[#0F172A]">
                    {detail.isAvailable ? 'Disponible' : 'No disponible'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
              TARIFA ESTIMADA
            </Text>
            <Text className="mt-1 text-3xl font-black text-[#1e3a8a]">
              ${Number.isFinite(price) ? price.toFixed(2) : '—'}
              <Text className="text-base font-bold text-[#94A3B8]"> / hr</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#E2E8F0] bg-white px-4 pb-8 pt-4">
        <Pressable
          className="items-center rounded-xl bg-[#1e3a8a] py-4 shadow-sm"
          onPress={() =>
            goToNewServiceRequest(router, {
              specialtySlug,
              professionalId,
              professionalName: name,
            })
          }
        >
          <Text className="text-base font-bold text-white">Solicitar servicio</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
