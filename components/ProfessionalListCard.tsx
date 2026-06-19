import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { ServiceProvider } from '../types';

interface ProfessionalListCardProps {
  service: ServiceProvider;
  onPress?: (service: ServiceProvider) => void;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const stars = Array.from({ length: 5 }, (_, i) => i < fullStars);

  return (
    <View className="flex-row items-center">
      {stars.map((filled, index) => (
        <Ionicons
          key={index}
          name={filled ? 'star' : 'star-outline'}
          size={14}
          color="#1e3a8a"
        />
      ))}
      <Text className="ml-1 text-xs font-semibold text-[#0F172A]">{rating}</Text>
    </View>
  );
}

export function ProfessionalListCard({ service, onPress }: ProfessionalListCardProps) {
  const handlePress = () => onPress?.(service);

  return (
    <View className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      <Pressable className="flex-row" onPress={handlePress}>
        <Image
          source={{ uri: service.imageUrl }}
          style={{ width: 112, height: 112 }}
          resizeMode="cover"
        />
        <View className="flex-1 justify-center p-3">
          <Text className="text-sm font-bold text-[#0F172A]">{service.name}</Text>
          <Text className="mt-0.5 text-xs text-[#94A3B8]">{service.role}</Text>
          <View className="my-2">
            <StarRating rating={service.rating} />
          </View>
          <Text className="text-sm font-bold text-[#1e3a8a]">${service.price}/hr</Text>
        </View>
      </Pressable>
      <View className="flex-row items-center justify-end border-t border-[#E2E8F0] px-3 py-2">
        <Pressable
          className="rounded-lg bg-[#1e3a8a] px-4 py-2"
          onPress={handlePress}
        >
          <Text className="text-xs font-bold text-white">Ver oferta</Text>
        </Pressable>
      </View>
    </View>
  );
}
