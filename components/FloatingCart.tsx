import { Pressable, Text, View } from 'react-native';

interface FloatingCartProps {
  itemCount: number;
  total: number;
  onPress?: () => void;
}

export function FloatingCart({ itemCount, total, onPress }: FloatingCartProps) {
  return (
    <View className="absolute bottom-24 left-4 right-4 z-50">
      <View className="flex-row items-center rounded-2xl bg-[#1A202C] px-4 py-3 shadow-lg">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-[#00A878]">
          <Text className="text-sm font-bold text-white">{itemCount}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-semibold tracking-widest text-[#94A3B8]">
            TOTAL CARRITO
          </Text>
          <Text className="text-lg font-black text-white">
            ${total.toFixed(2)}
          </Text>
        </View>
        <Pressable
          className="rounded-lg bg-[#00A878] px-4 py-2.5"
          onPress={onPress}
        >
          <Text className="text-xs font-bold text-white">VER PEDIDO</Text>
        </Pressable>
      </View>
    </View>
  );
}
