import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerPromo } from '../../../components/BannerPromo';
import { CategoryGrid } from '../../../components/CategoryGrid';
import { FloatingCart } from '../../../components/FloatingCart';
import { ProductCard } from '../../../components/ProductCard';
import { QuickActionButton } from '../../../components/QuickActionButton';
import { ServiceRequestCard } from '../../../components/ServiceRequestCard';
import {
  CATEGORIES,
  FEATURED_SERVICES,
  MOCK_CART,
  MOCK_USER,
  RECOMMENDED_PRODUCTS,
} from '../../../utils/constants';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-36 px-4"
          showsVerticalScrollIndicator={false}
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
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#00A878]">
                <Text className="text-sm font-bold text-white">
                  {MOCK_USER.initials}
                </Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <View className="mb-5 flex-row items-center rounded-xl bg-[#E2E8F0] px-4 py-3">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              className="ml-3 flex-1 text-sm text-[#0F172A]"
              placeholder="Buscar servicios o productos..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Categories */}
          <Text className="mb-3 text-sm font-black tracking-wide text-[#0F172A]">
            CATEGORÍAS
          </Text>
          <CategoryGrid categories={CATEGORIES} />

          {/* Quick actions */}
          <Text className="mb-3 mt-2 text-sm font-black tracking-wide text-[#0F172A]">
            ACCESOS RÁPIDOS
          </Text>
          <View className="mb-5 flex-row">
            <QuickActionButton label="Solicitar profesional" />
            <QuickActionButton label="Comprar materiales" />
            <QuickActionButton label="Emergencia 24/7" variant="emergency" />
          </View>

          {/* Promo banner */}
          <BannerPromo />

          {/* Featured services */}
          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <Text className="text-sm font-black tracking-wide text-[#0F172A]">
              SERVICIOS DESTACADOS
            </Text>
            <Text className="text-xs font-semibold text-[#00A878]">Ver todos</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {FEATURED_SERVICES.map((service) => (
              <ServiceRequestCard key={service.id} service={service} />
            ))}
          </ScrollView>

          {/* Recommended products */}
          <Text className="mb-3 text-sm font-black tracking-wide text-[#0F172A]">
            PRODUCTOS RECOMENDADOS
          </Text>
          <View className="flex-row">
            {RECOMMENDED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>

        </ScrollView>

        <FloatingCart
          itemCount={MOCK_CART.itemCount}
          total={MOCK_CART.total}
        />
      </View>
    </SafeAreaView>
  );
}
