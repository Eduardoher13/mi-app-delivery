import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { getDefaultTabHref } from '../utils/roles';

export default function Index() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#00A878" size="large" />
      </View>
    );
  }

  if (!user || !token) {
    return <Redirect href={'/login' as Href} />;
  }

  return <Redirect href={getDefaultTabHref(user.role)} />;
}
