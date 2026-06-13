import { Image, Pressable, Text, View } from 'react-native';

import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable
      className="mr-3 flex-1 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"
      onPress={() => onPress?.(product)}
    >
      <Image
        source={{ uri: product.imageUrl }}
        className="h-32 w-full"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-xs text-[#94A3B8]">{product.category}</Text>
        <Text className="mt-1 text-sm font-bold text-[#0F172A]" numberOfLines={2}>
          {product.name}
        </Text>
        <Text className="mt-2 text-base font-bold text-[#00A878]">
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}
