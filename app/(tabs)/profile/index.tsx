import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../../components/Avatar';
import { CompanyCatalog } from '../../../components/CompanyCatalog';
import { ProfessionalProfileEditor } from '../../../components/ProfessionalProfileEditor';
import { useAuth } from '../../../contexts/AuthContext';
import { useCompanyLogoUpload } from '../../../hooks/useCompanyLogoUpload';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { updateCompany } from '../../../services/companies';
import { getCompanyByUserId } from '../../../services/products';
import { Company } from '../../../types';
import {
  SUPABASE_FOLDER_AVATARS,
  SUPABASE_STORAGE_BUCKET,
} from '../../../utils/constants';
import { isCliente, isEmpresa, isProfesional } from '../../../utils/roles';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateAvatarUrl } = useAuth();
  const { uploading, error, pickImage, uploadImage } = useImageUpload();
  const {
    uploading: uploadingLogo,
    error: logoError,
    pickImage: pickLogoImage,
    uploadCompanyLogo,
  } = useCompanyLogoUpload();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const role = user?.role;
  const showCliente = isCliente(role) || (!isEmpresa(role) && !isProfesional(role));
  const showEmpresa = isEmpresa(role);
  const showProfesional = isProfesional(role);

  const loadCompany = useCallback(async () => {
    if (!user?.id || !showEmpresa) {
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
  }, [showEmpresa, user?.id]);

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

  const handleUploadCompanyLogo = async () => {
    if (!company) {
      return;
    }

    const uri = await pickLogoImage();
    if (!uri) {
      return;
    }

    const publicUrl = await uploadCompanyLogo(uri, company.id);
    const updated = await updateCompany(company.id, { logo_url: publicUrl });
    setCompany(updated);
    await updateAvatarUrl(publicUrl);
  };

  const profileTitle = showEmpresa ? 'Mi tienda' : 'Perfil';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-10">
        <Text className="text-2xl font-black text-[#0F172A]">{profileTitle}</Text>
        {user?.email ? (
          <Text className="mt-1 text-sm text-[#94A3B8]">
            {user.email} · {role ?? 'usuario'}
          </Text>
        ) : null}

        <View className="mt-6 items-center rounded-2xl border border-[#E2E8F0] bg-white p-6">
          {showEmpresa && company ? (
            <>
              <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[#E2E8F0]">
                {company.logo_url ? (
                  <Image
                    source={{ uri: company.logo_url }}
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="storefront-outline" size={40} color="#0F172A" />
                )}
              </View>
              <Text className="mt-3 text-lg font-bold text-[#0F172A]">
                {company.commercial_name}
              </Text>
              <Text className="mt-1 text-xs text-[#94A3B8]">
                Logo visible en el catálogo de tiendas
              </Text>
              <Pressable
                className="mt-4 rounded-lg bg-[#00A878] px-5 py-2.5"
                onPress={() => void handleUploadCompanyLogo()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-xs font-bold text-white">
                    Cambiar logo de la tienda
                  </Text>
                )}
              </Pressable>
              {logoError ? (
                <Text className="mt-3 text-center text-xs text-red-600">{logoError}</Text>
              ) : null}
            </>
          ) : (
            <>
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
            </>
          )}
        </View>

        {showCliente ? (
          <>
            <Pressable
              className="mt-4 items-center rounded-xl bg-[#0F172A] py-3"
              onPress={() => router.push('/service-requests')}
            >
              <Text className="text-sm font-bold text-white">Mis solicitudes de servicio</Text>
            </Pressable>
            <Pressable
              className="mt-3 items-center rounded-xl border border-[#0F172A] py-3"
              onPress={() => router.push('/orders')}
            >
              <Text className="text-sm font-bold text-[#0F172A]">Mis pedidos</Text>
            </Pressable>
          </>
        ) : null}

        {showEmpresa && company ? <CompanyCatalog company={company} /> : null}
        {showEmpresa && companyError ? (
          <Text className="mt-3 text-center text-xs text-red-600">{companyError}</Text>
        ) : null}

        {showProfesional && user?.id ? (
          <ProfessionalProfileEditor userId={user.id} />
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
