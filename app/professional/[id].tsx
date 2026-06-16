import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfessionalOfferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    role?: string;
    rating?: string;
    price?: string;
    imageUrl?: string;
    specialtySlug?: string;
  }>();

  const name = params.name ?? 'Profesional';
  const role = params.role ?? 'Servicio verificado';
  const rating = Number.parseFloat(params.rating ?? '0');
  const price = Number.parseFloat(params.price ?? '0');
  const imageUrl =
    params.imageUrl ?? `https://picsum.photos/seed/pro-${params.id}/400/400`;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="flex-row items-center px-4 pt-2">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text className="text-lg font-black text-[#0F172A]">Oferta del profesional</Text>
        </View>

        <Image
          source={{ uri: imageUrl }}
          className="mt-4 h-56 w-full"
          resizeMode="cover"
        />

        <View className="px-4 pt-5">
          <Text className="text-2xl font-black text-[#0F172A]">{name}</Text>
          <Text className="mt-1 text-sm text-[#94A3B8]">{role}</Text>

          <View className="mt-4 flex-row items-center">
            <Ionicons name="star" size={18} color="#00A878" />
            <Text className="ml-1 text-base font-bold text-[#0F172A]">
              {Number.isFinite(rating) ? rating.toFixed(1) : '—'}
            </Text>
            <Text className="ml-2 text-sm text-[#94A3B8]">valoración promedio</Text>
          </View>

          <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
              TARIFA
            </Text>
            <Text className="mt-1 text-3xl font-black text-[#00A878]">
              ${Number.isFinite(price) ? price.toFixed(2) : '—'}
              <Text className="text-base font-bold text-[#94A3B8]"> / hr</Text>
            </Text>
          </View>

          <Pressable
            className="mt-6 items-center rounded-xl bg-[#00A878] py-4"
            onPress={() => {
              router.push({
                pathname: '/(tabs)/services',
                params: params.specialtySlug
                  ? { slug: params.specialtySlug }
                  : undefined,
              });
            }}
          >
            <Text className="text-sm font-bold text-white">Ver más profesionales</Text>
          </Pressable>

          <Pressable
            className="mt-3 items-center rounded-xl border border-[#E2E8F0] py-4"
            disabled
          >
            <Text className="text-sm font-bold text-[#94A3B8]">
              Solicitar servicio — Fase 4
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
