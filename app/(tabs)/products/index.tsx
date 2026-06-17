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

import { ProductCard } from '../../../components/ProductCard';
import { FloatingCart } from '../../../components/FloatingCart';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useRoleRedirect } from '../../../hooks/useRoleRedirect';
import { formatApiError, getApiStatus } from '../../../services/api';
import { getProducts } from '../../../services/products';
import { Product } from '../../../types';
import { isCliente } from '../../../utils/roles';

const SEARCH_DEBOUNCE_MS = 400;

export default function ProductsScreen() {
  const router = useRouter();
  useRoleRedirect(isCliente);
  const { user } = useAuth();
  const { addItem, itemCount, subtotal } = useCart();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const { q } = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof q === 'string' ? q : '';
  const apiStatus = getApiStatus();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = useCallback(
    async (isRefresh = false, query = debouncedQuery) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await getProducts(query || undefined);
        setProducts(data);
    } catch (err) {
      setError(formatApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedQuery],
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedMessage(`${product.name} agregado al carrito`);
    setTimeout(() => setAddedMessage(null), 2000);
  };

  const showCart = isCliente(user?.role) && itemCount > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">Productos</Text>
        <Text className="mt-1 text-sm text-[#94A3B8]">
          {debouncedQuery
            ? `${products.length} resultado(s) para "${debouncedQuery}"`
            : products.length > 0
              ? `${products.length} productos`
              : 'Busca por nombre, descripción o empresa'}
        </Text>
        {__DEV__ ? (
          <Text className="mt-1 text-[10px] text-[#94A3B8]">
            API: {apiStatus.baseURL}
            {apiStatus.isLocalhost ? ' (localhost no sirve en Honor)' : ''}
          </Text>
        ) : null}

        <View className="mt-4 flex-row items-center rounded-xl bg-[#E2E8F0] px-4 py-3">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="ml-3 flex-1 text-sm text-[#0F172A]"
            placeholder="Ej: taladro, ferretería, pintura..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </Pressable>
          ) : null}
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
                ? `No hay productos que coincidan con "${debouncedQuery}"`
                : 'No hay productos activos en el catálogo'}
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
            <View className="flex-row flex-wrap">
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
