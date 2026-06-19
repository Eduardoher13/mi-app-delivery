import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  showAddButton?: boolean;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  onPress,
  showAddButton,
  onAddToCart,
}: ProductCardProps) {
  const outOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <View className="mr-3 flex-1 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      <Pressable onPress={() => onPress?.(product)}>
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: '100%', height: 128 }}
          resizeMode="cover"
        />
        <View className="p-3 pb-2">
          <Text className="text-xs text-[#94A3B8]">{product.category}</Text>
          <Text className="mt-1 text-sm font-bold text-[#0F172A]" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="mt-2 text-base font-bold text-[#00A878]">
            ${product.price.toFixed(2)}
          </Text>
        </View>
      </Pressable>
      {showAddButton ? (
        <View className="border-t border-[#E2E8F0] px-3 py-2">
          <Pressable
            className={`flex-row items-center justify-center rounded-lg py-2 ${
              outOfStock ? 'bg-[#E2E8F0]' : 'bg-[#00A878]'
            }`}
            onPress={() => !outOfStock && onAddToCart?.(product)}
            disabled={outOfStock}
          >
            <Ionicons
              name="cart-outline"
              size={14}
              color={outOfStock ? '#94A3B8' : '#FFFFFF'}
            />
            <Text
              className={`ml-1 text-xs font-bold ${
                outOfStock ? 'text-[#94A3B8]' : 'text-white'
              }`}
            >
              {outOfStock ? 'Sin stock' : 'Agregar'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
