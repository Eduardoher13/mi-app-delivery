import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { formatApiError } from '../../services/api';
import { checkoutCart } from '../../services/orders';
import { resolveClientId } from '../../services/serviceRequests';
import { isCliente } from '../../utils/roles';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useRoleRedirect(isCliente);

  const { lines, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user || lines.length === 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const clientId = await resolveClientId(user);
      const order = await checkoutCart(clientId, lines);
      await clearCart();
      router.replace({
        pathname: '/order/[id]',
        params: {
          id: order.id,
          total: order.total,
          status: order.status,
        },
      });
    } catch (err) {
      setError(formatApiError(err, 'No se pudo confirmar el pedido'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center px-4 pt-2">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text className="text-lg font-black text-[#0F172A]">Mi carrito</Text>
        </View>

        {lines.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="cart-outline" size={48} color="#94A3B8" />
            <Text className="mt-4 text-center text-sm text-[#94A3B8]">
              Tu carrito está vacío. Explora productos para agregar algo.
            </Text>
            <Pressable
              className="mt-6 rounded-xl bg-[#00A878] px-6 py-3"
              onPress={() => router.push('/(tabs)/products')}
            >
              <Text className="text-sm font-bold text-white">Ver productos</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-32">
              {lines.map((line) => (
                <View
                  key={line.productId}
                  className="mb-3 flex-row rounded-xl border border-[#E2E8F0] bg-white p-3"
                >
                  <Image
                    source={{ uri: line.imageUrl }}
                    className="h-20 w-20 rounded-lg"
                    resizeMode="cover"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-[#0F172A]" numberOfLines={2}>
                      {line.name}
                    </Text>
                    <Text className="mt-1 text-sm font-bold text-[#00A878]">
                      ${line.price.toFixed(2)}
                    </Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Pressable
                          className="h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0]"
                          onPress={() => updateQuantity(line.productId, line.quantity - 1)}
                        >
                          <Ionicons name="remove" size={16} color="#0F172A" />
                        </Pressable>
                        <Text className="mx-3 text-sm font-bold text-[#0F172A]">
                          {line.quantity}
                        </Text>
                        <Pressable
                          className="h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0]"
                          onPress={() => updateQuantity(line.productId, line.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color="#0F172A" />
                        </Pressable>
                      </View>
                      <Pressable onPress={() => removeItem(line.productId)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-[#E2E8F0] bg-white px-4 pb-8 pt-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-[#94A3B8]">Subtotal</Text>
                <Text className="text-xl font-black text-[#0F172A]">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              {error ? (
                <Text className="mb-3 text-center text-sm text-red-600">{error}</Text>
              ) : null}
              <Pressable
                className="items-center rounded-xl bg-[#00A878] py-4"
                onPress={() => void handleCheckout()}
                disabled={submitting || lines.length === 0}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-bold text-white">Confirmar pedido</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
