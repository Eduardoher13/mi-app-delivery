import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapPreview } from '../../components/MapPreview';
import { useAuth } from '../../contexts/AuthContext';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useLocation } from '../../hooks/useLocation';
import { MOCK_USER } from '../../utils/constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { coords, loading: locationLoading } = useLocation();
  const { uploading, pickImage, uploadImage } = useImageUpload();

  const handleUploadAvatar = async () => {
    const uri = await pickImage();
    if (uri) {
      await uploadImage(uri, { bucket: 'avatars', folder: 'profiles' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-black text-[#0F172A]">Perfil</Text>

        <View className="mt-6 items-center rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#00A878]">
            <Text className="text-2xl font-bold text-white">
              {MOCK_USER.initials}
            </Text>
          </View>
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
              <Text className="text-xs font-bold text-white">
                Subir foto (mock)
              </Text>
            )}
          </Pressable>
        </View>

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
      </View>
    </SafeAreaView>
  );
}
