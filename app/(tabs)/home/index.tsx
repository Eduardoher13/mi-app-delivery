import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

import { BannerPromo } from '../../../components/BannerPromo';
import { Avatar } from '../../../components/Avatar';
import { CategoryGrid } from '../../../components/CategoryGrid';
import { ProductCard } from '../../../components/ProductCard';
import { QuickActionButton } from '../../../components/QuickActionButton';
import { ServiceRequestCard } from '../../../components/ServiceRequestCard';
import { useAuth } from '../../../contexts/AuthContext';
import { formatApiError } from '../../../services/api';
import { getActiveProducts } from '../../../services/products';
import { getAvailableProfessionals } from '../../../services/professionals';
import { Category, Product, ServiceProvider } from '../../../types';
import { CATEGORIES, MOCK_USER } from '../../../utils/constants';
import { goToProfessionalOffer } from '../../../utils/navigation';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState<ServiceProvider[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToServices = useCallback(
    (slug?: string) => {
      if (slug) {
        router.push({ pathname: '/(tabs)/services', params: { slug } });
        return;
      }

      router.push('/(tabs)/services');
    },
    [router],
  );

  const goToProducts = useCallback(
    (q?: string) => {
      if (q?.trim()) {
        router.push({ pathname: '/(tabs)/products', params: { q: q.trim() } });
        return;
      }

      router.push('/(tabs)/products');
    },
    [router],
  );

  const loadHomeData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [professionals, products] = await Promise.all([
        getAvailableProfessionals({ limit: 6 }),
        getActiveProducts({ limit: 4 }),
      ]);
      setFeaturedServices(professionals);
      setRecommendedProducts(products);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  const handleCategoryPress = (category: Category) => {
    goToServices(category.slug);
  };

  const handleSearchSubmit = () => {
    goToProducts(searchQuery);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadHomeData(true)}
              tintColor="#00A878"
            />
          }
        >
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between pt-2">
            <View>
              <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                BIENVENIDO
              </Text>
              <Text className="text-2xl font-black italic text-[#00A878]">
                CasaIA
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white">
                <Ionicons name="notifications-outline" size={20} color="#0F172A" />
              </View>
              <Avatar
                name={user?.name ?? MOCK_USER.name}
                avatarUrl={user?.avatarUrl}
                size={40}
              />
            </View>
          </View>

          {/* Search */}
          <View className="mb-5 flex-row items-center rounded-xl bg-[#E2E8F0] px-4 py-3">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              className="ml-3 flex-1 text-sm text-[#0F172A]"
              placeholder="Buscar servicios o productos..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoCorrect={false}
            />
          </View>

          {/* Categories */}
          <Text className="mb-3 text-sm font-black tracking-wide text-[#0F172A]">
            CATEGORÍAS
          </Text>
          <CategoryGrid categories={CATEGORIES} onCategoryPress={handleCategoryPress} />

          {/* Quick actions */}
          <Text className="mb-3 mt-2 text-sm font-black tracking-wide text-[#0F172A]">
            ACCESOS RÁPIDOS
          </Text>
          <View className="mb-5 flex-row">
            <QuickActionButton
              label="Solicitar profesional"
              onPress={() => goToServices()}
            />
            <QuickActionButton
              label="Comprar materiales"
              onPress={() => goToProducts()}
            />
            <QuickActionButton
              label="Emergencia 24/7"
              variant="emergency"
              onPress={() => goToServices('emergencia')}
            />
          </View>

          {/* Promo banner */}
          <BannerPromo />

          {loading ? (
            <View className="my-10 items-center justify-center">
              <ActivityIndicator color="#00A878" size="large" />
            </View>
          ) : error ? (
            <View className="my-10 items-center justify-center px-4">
              <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
            </View>
          ) : (
            <>
              {/* Featured services */}
              <View className="mb-3 mt-6 flex-row items-center justify-between">
                <Text className="text-sm font-black tracking-wide text-[#0F172A]">
                  SERVICIOS DESTACADOS
                </Text>
                <Pressable onPress={() => goToServices()} hitSlop={8}>
                  <Text className="text-xs font-semibold text-[#00A878]">Ver todos</Text>
                </Pressable>
              </View>
              {featuredServices.length === 0 ? (
                <Text className="mb-6 text-sm text-[#94A3B8]">
                  No hay profesionales disponibles por ahora.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-6"
                >
                  {featuredServices.map((service) => (
                    <ServiceRequestCard
                      key={service.id}
                      service={service}
                      onPress={(item) => goToProfessionalOffer(router, item)}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Recommended products */}
              <Text className="mb-3 text-sm font-black tracking-wide text-[#0F172A]">
                PRODUCTOS RECOMENDADOS
              </Text>
              {recommendedProducts.length === 0 ? (
                <Text className="text-sm text-[#94A3B8]">
                  No hay productos recomendados en este momento.
                </Text>
              ) : (
                <View className="flex-row flex-wrap">
                  {recommendedProducts.map((product) => (
                    <View key={product.id} className="mb-3 w-1/2 pr-2">
                      <ProductCard
                        product={product}
                        onPress={() => goToProducts(product.name)}
                      />
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
