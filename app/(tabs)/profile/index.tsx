import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../../components/Avatar';
import { CompanyCatalog } from '../../../components/CompanyCatalog';
import { useAuth } from '../../../contexts/AuthContext';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { getCompanyByUserId } from '../../../services/products';
import { Company } from '../../../types';
import {
  SUPABASE_FOLDER_AVATARS,
  SUPABASE_STORAGE_BUCKET,
} from '../../../utils/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateAvatarUrl } = useAuth();
  const { uploading, error, pickImage, uploadImage } = useImageUpload();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const role = user?.role;
  const isCliente = role === 'cliente';
  const isEmpresa = role === 'empresa';
  const isProfesional = role === 'profesional';

  const loadCompany = useCallback(async () => {
    if (!user?.id || user.role !== 'empresa') {
      setCompany(null);
      return;
    }

    setCompanyError(null);
    try {
      const data = await getCompanyByUserId(user.id);
      setCompany(data);
    } catch {
      setCompany(null);
      setCompanyError(
        'No se encontró empresa para este usuario. Ejecuta npm run seed en el backend.',
      );
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    void loadCompany();
  }, [loadCompany]);

  const handleUploadAvatar = async () => {
    const uri = await pickImage();
    if (uri) {
      const publicUrl = await uploadImage(uri, {
        bucket: SUPABASE_STORAGE_BUCKET,
        folder: `${SUPABASE_FOLDER_AVATARS}/profiles`,
      });
      await updateAvatarUrl(publicUrl);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-10">
        <Text className="text-2xl font-black text-[#0F172A]">Perfil</Text>
        {user?.email ? (
          <Text className="mt-1 text-sm text-[#94A3B8]">
            {user.email} · {role ?? 'usuario'}
          </Text>
        ) : null}

        <View className="mt-6 items-center rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <Avatar name={user?.name ?? 'Usuario'} avatarUrl={user?.avatarUrl} size={80} />
          <Text className="mt-3 text-lg font-bold text-[#0F172A]">
            {user?.name ?? 'Usuario'}
          </Text>

          <Pressable
            className="mt-4 rounded-lg bg-[#00A878] px-5 py-2.5"
            onPress={() => void handleUploadAvatar()}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-xs font-bold text-white">Subir foto</Text>
            )}
          </Pressable>
          {error ? (
            <Text className="mt-3 text-center text-xs text-red-600">{error}</Text>
          ) : null}
        </View>

        {isCliente ? (
          <Pressable
            className="mt-4 items-center rounded-xl bg-[#0F172A] py-3"
            onPress={() => router.push('/service-requests')}
          >
            <Text className="text-sm font-bold text-white">Mis solicitudes de servicio</Text>
          </Pressable>
        ) : null}

        {isEmpresa && company ? <CompanyCatalog company={company} /> : null}
        {isEmpresa && companyError ? (
          <Text className="mt-3 text-center text-xs text-red-600">{companyError}</Text>
        ) : null}

        {isProfesional ? (
          <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <Text className="text-sm font-black text-[#0F172A]">Panel profesional</Text>
            <Text className="mt-2 text-sm text-[#94A3B8]">
              Próximamente: ofertas, asignaciones y disponibilidad.
            </Text>
          </View>
        ) : null}

        <Pressable
          className="mt-8 items-center rounded-xl border border-[#E2E8F0] py-4"
          onPress={() => void signOut()}
        >
          <Text className="text-sm font-bold text-[#0F172A]">Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
