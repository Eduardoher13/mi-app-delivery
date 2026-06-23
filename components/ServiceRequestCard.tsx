import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { ServiceProvider } from '../types';
import { formatCordobaPerHour } from '../utils/currency';

interface ServiceRequestCardProps {
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

export function ServiceRequestCard({ service, onPress }: ServiceRequestCardProps) {
  const handlePress = () => onPress?.(service);

  return (
    <View className="mr-3 w-44 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      <Pressable onPress={handlePress}>
        <Image
          source={{ uri: service.imageUrl }}
          className="h-28 w-full"
          resizeMode="cover"
        />
        <View className="p-3 pb-2">
          <Text className="text-sm font-bold text-[#0F172A]">{service.name}</Text>
          <Text className="text-xs text-[#94A3B8]">{service.role}</Text>
          <View className="my-2">
            <StarRating rating={service.rating} />
          </View>
        </View>
      </Pressable>
      <View className="flex-row items-center justify-between px-3 pb-3">
        <Text className="text-sm font-bold text-[#1e3a8a]">
          {formatCordobaPerHour(service.price)}
        </Text>
        <Pressable
          className="rounded-lg bg-[#1e3a8a] px-3 py-1.5"
          onPress={handlePress}
        >
          <Text className="text-xs font-bold text-white">Ver oferta</Text>
        </Pressable>
      </View>
    </View>
  );
}
