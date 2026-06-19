import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface BannerPromoProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
}

export function BannerPromo({
  title = 'SERIE TOUGHBUILT',
  subtitle = 'Precisión profesional para trabajo pesado en obra.',
  badge = 'OFERTA FLASH',
  onPress,
}: BannerPromoProps) {
  return (
    <View className="overflow-hidden rounded-2xl bg-[#1e3a8a] p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="mb-1 text-xs font-bold tracking-widest text-white/90">
            {badge}
          </Text>
          <Text className="text-xl font-black italic text-white">{title}</Text>
          <Text className="mt-2 text-sm text-white/80">{subtitle}</Text>
          <Pressable
            className="mt-4 self-start rounded-lg bg-white px-5 py-2.5"
            onPress={onPress}
          >
            <Text className="text-xs font-bold text-[#1e3a8a]">VER OFERTA</Text>
          </Pressable>
        </View>
        <View className="h-20 w-20 items-center justify-center rounded-full bg-white/10">
          <Ionicons name="construct" size={40} color="#1e3a8a" />
        </View>
      </View>
    </View>
  );
}
