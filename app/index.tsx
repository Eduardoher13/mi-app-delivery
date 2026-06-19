import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, Image, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { getDefaultTabHref } from '../utils/roles';

export default function Index() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1e3a8a]">
        <Image
          source={require('../assets/splash-icon.png')}
          style={{ width: 176, height: 176 }}
          resizeMode="contain"
          accessibilityLabel="Listo!"
        />
        <View className="mt-8">
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      </View>
    );
  }

  if (!user || !token) {
    return <Redirect href={'/login' as Href} />;
  }

  return <Redirect href={getDefaultTabHref(user.role)} />;
}
