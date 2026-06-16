import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../../components/Avatar';
import { CompanyCatalog } from '../../../components/CompanyCatalog';
import { MapPreview } from '../../../components/MapPreview';
import { useAuth } from '../../../contexts/AuthContext';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { useLocation } from '../../../hooks/useLocation';
import { getCompanyByUserId } from '../../../services/products';
import {
  getSupabaseStatus,
  resolveSupabaseConfigForDebug,
} from '../../../services/supabase';
import { testStorageConnection } from '../../../services/storageUpload';
import { Company } from '../../../types';
import {
  MOCK_USER,
  SUPABASE_FOLDER_AVATARS,
  SUPABASE_STORAGE_BUCKET,
} from '../../../utils/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateAvatarUrl, loginAsEmpresaDemo, loginAsClienteDemo } = useAuth();
  const { coords, loading: locationLoading } = useLocation();
  const { uploading, error, pickImage, uploadImage } = useImageUpload();
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [switchingCliente, setSwitchingCliente] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const supabaseStatus = getSupabaseStatus();
  const supabaseDebug = resolveSupabaseConfigForDebug();

  const isEmpresa = user?.role === 'empresa';
  const isCliente = user?.role === 'cliente';

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
    setTestMessage(null);
    const uri = await pickImage();
    if (uri) {
      const publicUrl = await uploadImage(uri, {
        bucket: SUPABASE_STORAGE_BUCKET,
        folder: `${SUPABASE_FOLDER_AVATARS}/profiles`,
      });
      await updateAvatarUrl(publicUrl);
    }
  };

  const handleTestStorage = async () => {
    setTestMessage(null);
    setTesting(true);
    try {
      await testStorageConnection();
      setTestMessage('✓ Storage OK (misma prueba que verify:supabase)');
    } catch (err) {
      setTestMessage(err instanceof Error ? err.message : 'Error en prueba Storage');
    } finally {
      setTesting(false);
    }
  };

  const handleEmpresaDemo = async () => {
    setSwitchingRole(true);
    setCompanyError(null);
    try {
      await loginAsEmpresaDemo();
    } catch {
      setCompanyError(
        'No se pudo cargar tienda@empresa.com. ¿Backend encendido y seed ejecutado?',
      );
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleClienteDemo = async () => {
    setSwitchingCliente(true);
    setCompanyError(null);
    try {
      await loginAsClienteDemo();
    } catch {
      setCompanyError(
        'No se pudo cargar demo@cliente.com. ¿Backend encendido y seed ejecutado?',
      );
    } finally {
      setSwitchingCliente(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-10">
        <Text className="text-2xl font-black text-[#0F172A]">Perfil</Text>

        {!isEmpresa ? (
          <Pressable
            className="mt-4 items-center rounded-xl border border-[#00A878] py-3"
            onPress={() => void handleEmpresaDemo()}
            disabled={switchingRole}
          >
            {switchingRole ? (
              <ActivityIndicator color="#00A878" />
            ) : (
              <Text className="text-sm font-bold text-[#00A878]">
                Entrar como empresa demo (catálogo)
              </Text>
            )}
          </Pressable>
        ) : (
          <Text className="mt-2 text-xs text-[#00A878]">
            Modo empresa · {user?.email ?? 'tienda@empresa.com'}
          </Text>
        )}

        {!isCliente ? (
          <Pressable
            className="mt-3 items-center rounded-xl border border-[#0F172A] py-3"
            onPress={() => void handleClienteDemo()}
            disabled={switchingCliente}
          >
            {switchingCliente ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text className="text-sm font-bold text-[#0F172A]">
                Actuar como cliente demo (solicitudes)
              </Text>
            )}
          </Pressable>
        ) : (
          <Text className="mt-2 text-xs text-[#0F172A]">
            Modo cliente · {user?.email ?? 'demo@cliente.com'}
          </Text>
        )}

        {isCliente ? (
          <Pressable
            className="mt-3 items-center rounded-xl bg-[#0F172A] py-3"
            onPress={() => router.push('/service-requests')}
          >
            <Text className="text-sm font-bold text-white">Mis solicitudes de servicio</Text>
          </Pressable>
        ) : null}

        <View className="mt-6 items-center rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <Avatar
            name={user?.name ?? MOCK_USER.name}
            avatarUrl={user?.avatarUrl}
            size={80}
          />
          <Text className="mt-3 text-lg font-bold text-[#0F172A]">
            {user?.name ?? MOCK_USER.name}
          </Text>
          <Text className="text-sm text-[#94A3B8]">ID: {user?.id ?? MOCK_USER.id}</Text>

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
          {testMessage ? (
            <Text
              className={`mt-3 text-center text-xs ${testMessage.startsWith('✓') ? 'text-[#00A878]' : 'text-red-600'}`}
            >
              {testMessage}
            </Text>
          ) : null}
          {__DEV__ ? (
            <>
              <Pressable
                className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2"
                onPress={() => void handleTestStorage()}
                disabled={testing || uploading}
              >
                {testing ? (
                  <ActivityIndicator color="#00A878" />
                ) : (
                  <Text className="text-center text-[10px] font-bold text-[#0F172A]">
                    Probar Storage (dev)
                  </Text>
                )}
              </Pressable>
              <Text className="mt-3 text-center text-[10px] text-[#94A3B8]">
                Supabase: {supabaseStatus.configured ? 'OK' : 'NO CONFIG'} · proyecto{' '}
                {supabaseStatus.projectRef ?? '?'} · bucket {SUPABASE_STORAGE_BUCKET}
                {'\n'}Origen: {supabaseDebug.source} · {supabaseDebug.urlPreview}
              </Text>
            </>
          ) : null}
        </View>

        {isEmpresa && company ? <CompanyCatalog company={company} /> : null}
        {companyError ? (
          <Text className="mt-3 text-center text-xs text-red-600">{companyError}</Text>
        ) : null}

        <Text className="mb-3 mt-8 text-sm font-black tracking-wide text-[#0F172A]">
          UBICACIÓN
        </Text>
        <MapPreview
          latitude={coords.latitude}
          longitude={coords.longitude}
          loading={locationLoading}
        />

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
