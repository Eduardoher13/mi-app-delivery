import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { formatApiError } from '../services/api';
import { DEMO_CLIENTE_EMAIL, DEMO_PASSWORD } from '../utils/constants';
import { getDefaultTabHref } from '../utils/roles';

export default function LoginScreen() {
  const router = useRouter();
  const { user, token, loading: authLoading, login, loginAsClienteDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && token) {
      router.replace(getDefaultTabHref(user.role));
    }
  }, [authLoading, user, token, router]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Ingresa email y contraseña.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      router.replace(getDefaultTabHref(loggedInUser.role));
    } catch (err) {
      setError(formatApiError(err, 'No se pudo iniciar sesión'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClienteDemo = async () => {
    setEmail(DEMO_CLIENTE_EMAIL);
    setPassword(DEMO_PASSWORD);
    setSubmitting(true);
    setError(null);

    try {
      await loginAsClienteDemo();
      router.replace(getDefaultTabHref('cliente'));
    } catch (err) {
      setError(formatApiError(err, 'No se pudo iniciar sesión demo'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#1e3a8a" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="grow justify-center pb-10 pt-8"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
            BIENVENIDO A
          </Text>
          <Text className="text-3xl font-black italic text-[#1e3a8a]">Listo!</Text>
          <Text className="mt-2 text-sm text-[#94A3B8]">
            Inicia sesión para solicitar servicios o gestionar tu cuenta
          </Text>

          <Text className="mb-2 mt-8 text-xs font-semibold tracking-widest text-[#94A3B8]">
            EMAIL
          </Text>
          <TextInput
            className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
            placeholder="tu@email.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
            CONTRASEÑA
          </Text>
          <TextInput
            className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? (
            <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
          ) : null}

          <Pressable
            className="mt-6 items-center rounded-xl bg-[#1e3a8a] py-4"
            onPress={() => void handleLogin()}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-bold text-white">Iniciar sesión</Text>
            )}
          </Pressable>

          <View className="mt-5 flex-row flex-wrap items-center justify-center">
            <Text className="text-sm text-[#94A3B8]">¿No tienes una cuenta? </Text>
            <Link href="/register" asChild>
              <Pressable hitSlop={8}>
                <Text className="text-sm font-bold text-[#1e3a8a]">Regístrate aquí</Text>
              </Pressable>
            </Link>
          </View>

          <Pressable
            className="mt-8 items-center rounded-xl border border-[#0F172A] py-3"
            onPress={() => void handleClienteDemo()}
            disabled={submitting}
          >
            <Text className="text-sm font-bold text-[#0F172A]">Entrar como cliente demo</Text>
          </Pressable>
          <Text className="mt-2 text-center text-[10px] text-[#94A3B8]">
            Jurado: contraseña {DEMO_PASSWORD}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
