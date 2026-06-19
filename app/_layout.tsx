import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { SplashGate } from '../components/SplashGate';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SplashGate>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="professional/[id]" />
              <Stack.Screen name="service-request/new" />
              <Stack.Screen name="service-request/[id]" />
              <Stack.Screen name="service-requests/index" />
              <Stack.Screen name="pro-request/[id]" />
              <Stack.Screen name="cart/index" />
              <Stack.Screen name="cart/checkout" />
              <Stack.Screen name="store/[companyId]" />
              <Stack.Screen name="order/[id]" />
              <Stack.Screen name="orders/index" />
              <Stack.Screen name="delivery/[id]" />
            </Stack>
          </CartProvider>
        </SplashGate>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
