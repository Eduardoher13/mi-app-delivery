import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '../../components/ProductCard';
import { FloatingCart } from '../../components/FloatingCart';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { formatApiError } from '../../services/api';
import { getProductsByCompany } from '../../services/products';
import { Product } from '../../types';
import { isCliente } from '../../utils/roles';

const SEARCH_DEBOUNCE_MS = 400;

export default function CompanyStoreScreen() {
  const router = useRouter();
  useRoleRedirect(isCliente);
  const { user } = useAuth();
  const { itemCount, subtotal, cartCompanyName } = useCart();
  const { tryAddToCart } = useAddToCart();
  const params = useLocalSearchParams<{ companyId?: string; name?: string }>();
  const companyId = typeof params.companyId === 'string' ? params.companyId : '';
  const companyName =
    typeof params.name === 'string' && params.name.trim()
      ? params.name.trim()
      : 'Ferretería';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = useCallback(
    async (isRefresh = false, query = debouncedQuery) => {
      if (!companyId) {
        setError('Ferretería no encontrada');
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await getProductsByCompany(companyId, query || undefined);
        setProducts(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [companyId, debouncedQuery],
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleAddToCart = (product: Product) => {
    if (tryAddToCart(product)) {
      setAddedMessage(`${product.name} agregado al carrito`);
      setTimeout(() => setAddedMessage(null), 2000);
    }
  };

  const showCart = isCliente(user?.role) && itemCount > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-black text-[#0F172A]" numberOfLines={2}>
              {companyName}
            </Text>
            <Text className="text-xs text-[#94A3B8]">
              {products.length} producto(s)
              {cartCompanyName ? ` · Carrito: ${cartCompanyName}` : ''}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl bg-[#E2E8F0] px-4 py-3">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="ml-3 flex-1 text-sm text-[#0F172A]"
            placeholder="Buscar en esta ferretería..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        {addedMessage ? (
          <View className="mt-2 rounded-lg bg-[#00A878]/10 px-3 py-2">
            <Text className="text-center text-xs font-semibold text-[#00A878]">
              {addedMessage}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00A878" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#94A3B8]">
              {debouncedQuery
                ? `Sin resultados para "${debouncedQuery}"`
                : 'Esta ferretería no tiene productos activos'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            contentContainerClassName={showCart ? 'pb-36' : 'pb-8'}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadProducts(true)}
                tintColor="#00A878"
              />
            }
          >
            <View className="flex-row flex-wrap items-stretch">
              {products.map((product) => (
                <View key={product.id} className="mb-3 w-1/2 pr-2">
                  <ProductCard
                    product={product}
                    showAddButton
                    onAddToCart={handleAddToCart}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {showCart ? (
        <FloatingCart
          itemCount={itemCount}
          total={subtotal}
          onPress={() => router.push('/cart')}
        />
      ) : null}
    </SafeAreaView>
  );
}
