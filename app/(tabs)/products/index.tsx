import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompanyStoreCard } from '../../../components/CompanyStoreCard';
import { useAuth } from '../../../contexts/AuthContext';
import { useRoleRedirect } from '../../../hooks/useRoleRedirect';
import { formatApiError } from '../../../services/api';
import { getCompanies } from '../../../services/companies';
import { getProductsByCompany } from '../../../services/products';
import { Company } from '../../../types';
import { isCliente } from '../../../utils/roles';

interface CompanyWithCount extends Company {
  productCount: number;
}

export default function ProductsScreen() {
  const router = useRouter();
  useRoleRedirect(isCliente);
  const { user } = useAuth();

  const [stores, setStores] = useState<CompanyWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStores = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const companies = await getCompanies({ limit: 100 });
      const withCounts = await Promise.all(
        companies.map(async (company) => {
          const products = await getProductsByCompany(company.id);
          return { ...company, productCount: products.length };
        }),
      );
      setStores(withCounts);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const filteredStores = stores.filter((store) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return store.commercial_name.toLowerCase().includes(q);
  });

  const openStore = (company: Company) => {
    router.push({
      pathname: '/store/[companyId]',
      params: { companyId: company.id, name: company.commercial_name },
    });
  };

  if (!isCliente(user?.role)) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">Ferreterías</Text>
        <Text className="mt-1 text-sm text-[#94A3B8]">
          Elige una tienda para ver su catálogo y comprar
        </Text>

        <View className="mt-4 flex-row items-center rounded-xl bg-[#E2E8F0] px-4 py-3">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="ml-3 flex-1 text-sm text-[#0F172A]"
            placeholder="Buscar ferretería..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1e3a8a" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#0F172A]">{error}</Text>
          </View>
        ) : filteredStores.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-sm text-[#94A3B8]">
              {searchQuery.trim()
                ? 'No hay ferreterías con ese nombre'
                : 'No hay ferreterías registradas'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            contentContainerClassName="pb-8"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadStores(true)}
                tintColor="#1e3a8a"
              />
            }
          >
            {filteredStores.map((store) => (
              <CompanyStoreCard
                key={store.id}
                company={store}
                productCount={store.productCount}
                onPress={openStore}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
