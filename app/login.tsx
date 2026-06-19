import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import {
  DEMO_CLIENTE_EMAIL,
  DEMO_COMPANY_ACCOUNTS,
  DEMO_EMPRESA_EMAIL,
  DEMO_PASSWORD,
  DEMO_PROFESIONAL_EMAIL,
} from '../utils/constants';
import { getDefaultTabHref } from '../utils/roles';

function resolveDemoRole(email: string): string {
  if (email === DEMO_EMPRESA_EMAIL || email.endsWith('@empresa.com')) {
    return 'empresa';
  }
  if (email === DEMO_PROFESIONAL_EMAIL) {
    return 'profesional';
  }
  return 'cliente';
}

export default function LoginScreen() {
  const router = useRouter();
  const {
    user,
    token,
    loading: authLoading,
    login,
    loginAsClienteDemo,
    loginAsEmpresaDemo,
    loginAsProfesionalDemo,
  } = useAuth();

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

  const handleDemoLogin = async (
    demoLogin: () => Promise<void>,
    demoEmail: string,
  ) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setSubmitting(true);
    setError(null);

    try {
      await demoLogin();
      router.replace(getDefaultTabHref(resolveDemoRole(demoEmail)));
    } catch (err) {
      setError(formatApiError(err, 'No se pudo iniciar sesión demo'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#00A878" size="large" />
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
          <Text className="text-3xl font-black italic text-[#00A878]">CasaIA</Text>
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
            className="mt-6 items-center rounded-xl bg-[#00A878] py-4"
            onPress={() => void handleLogin()}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-bold text-white">Iniciar sesión</Text>
            )}
          </Pressable>

          <Text className="mb-3 mt-8 text-xs font-semibold tracking-widest text-[#94A3B8]">
            ACCESOS RÁPIDOS DEMO
          </Text>

          <Pressable
            className="mb-2 items-center rounded-xl border border-[#0F172A] py-3"
            onPress={() => void handleDemoLogin(loginAsClienteDemo, DEMO_CLIENTE_EMAIL)}
            disabled={submitting}
          >
            <Text className="text-sm font-bold text-[#0F172A]">Entrar como cliente</Text>
          </Pressable>

          <Pressable
            className="mb-2 items-center rounded-xl border border-[#00A878] py-3"
            onPress={() => void handleDemoLogin(loginAsEmpresaDemo, DEMO_EMPRESA_EMAIL)}
            disabled={submitting}
          >
            <Text className="text-sm font-bold text-[#00A878]">Entrar como empresa (SINSA)</Text>
          </Pressable>

          <View className="mb-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <Text className="text-xs font-semibold text-[#0F172A]">
              Otras ferreterías demo (contraseña {DEMO_PASSWORD})
            </Text>
            {DEMO_COMPANY_ACCOUNTS.filter((a) => a.email !== DEMO_EMPRESA_EMAIL).map(
              (account) => (
                <Pressable
                  key={account.email}
                  className="mt-2 rounded-lg border border-[#E2E8F0] bg-white py-2.5"
                  onPress={() =>
                    void (async () => {
                      setEmail(account.email);
                      setPassword(DEMO_PASSWORD);
                      setSubmitting(true);
                      setError(null);
                      try {
                        const loggedInUser = await login(account.email, DEMO_PASSWORD);
                        router.replace(getDefaultTabHref(loggedInUser.role));
                      } catch (err) {
                        setError(formatApiError(err, 'No se pudo iniciar sesión'));
                      } finally {
                        setSubmitting(false);
                      }
                    })()
                  }
                  disabled={submitting}
                >
                  <Text className="text-center text-xs font-bold text-[#0F172A]">
                    {account.name}
                  </Text>
                  <Text className="mt-0.5 text-center text-[10px] text-[#94A3B8]">
                    {account.email}
                  </Text>
                </Pressable>
              ),
            )}
          </View>

          <Pressable
            className="items-center rounded-xl border border-[#E2E8F0] py-3"
            onPress={() =>
              void handleDemoLogin(loginAsProfesionalDemo, DEMO_PROFESIONAL_EMAIL)
            }
            disabled={submitting}
          >
            <Text className="text-sm font-bold text-[#0F172A]">Entrar como profesional</Text>
          </Pressable>

          <View className="mt-6 flex-row items-center justify-center">
            <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" />
            <Text className="ml-1 text-[10px] text-[#94A3B8]">
              Demo: contraseña {DEMO_PASSWORD}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
