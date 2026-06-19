import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { Company } from '../types';

interface CompanyStoreCardProps {
  company: Company;
  productCount?: number;
  onPress?: (company: Company) => void;
}

export function CompanyStoreCard({
  company,
  productCount,
  onPress,
}: CompanyStoreCardProps) {
  return (
    <Pressable
      className="mb-3 flex-row items-center rounded-xl border border-[#E2E8F0] bg-white p-4"
      onPress={() => onPress?.(company)}
    >
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#E2E8F0]">
        {company.logo_url ? (
          <Image
            source={{ uri: company.logo_url }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="storefront-outline" size={28} color="#0F172A" />
        )}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm font-bold text-[#0F172A]" numberOfLines={2}>
          {company.commercial_name}
        </Text>
        <Text className="mt-1 text-xs text-[#94A3B8]">
          {productCount != null
            ? `${productCount} producto(s) disponibles`
            : 'Ver catálogo'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </Pressable>
  );
}
