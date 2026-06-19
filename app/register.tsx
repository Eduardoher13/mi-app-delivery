import { Ionicons } from '@expo/vector-icons';
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
import { PhoneInput } from '../components/PhoneInput';
import { formatApiError } from '../services/api';
import { getDefaultTabHref } from '../utils/roles';
import { isOptionalPhoneValid, getPhoneValidationMessage } from '../utils/phoneFormat';

export default function RegisterScreen() {
  const router = useRouter();
  const { user, token, loading: authLoading, registerCliente } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && token) {
      router.replace(getDefaultTabHref(user.role));
    }
  }, [authLoading, user, token, router]);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ingresa tu nombre y apellido.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Ingresa email y contraseña.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isOptionalPhoneValid(phone)) {
      setError(getPhoneValidationMessage());
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const registeredUser = await registerCliente({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        city: city.trim() || undefined,
      });
      router.replace(getDefaultTabHref(registeredUser.role));
    } catch (err) {
      setError(formatApiError(err, 'No se pudo crear la cuenta'));
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
          contentContainerClassName="grow pb-10 pt-8"
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            className="mb-4 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>

          <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
            CREAR CUENTA EN
          </Text>
          <Text className="text-3xl font-black italic text-[#00A878]">CasaIA</Text>
          <Text className="mt-2 text-sm text-[#94A3B8]">
            Regístrate como cliente para solicitar servicios y comprar materiales
          </Text>

          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-xs font-semibold tracking-widest text-[#94A3B8]">
                NOMBRE
              </Text>
              <TextInput
                className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
                placeholder="María"
                placeholderTextColor="#94A3B8"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-xs font-semibold tracking-widest text-[#94A3B8]">
                APELLIDO
              </Text>
              <TextInput
                className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
                placeholder="López"
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
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
            TELÉFONO (OPCIONAL)
          </Text>
          <PhoneInput value={phone} onChangeValue={setPhone} />

          <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
            CIUDAD (OPCIONAL)
          </Text>
          <TextInput
            className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
            placeholder="Managua"
            placeholderTextColor="#94A3B8"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />

          <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
            CONTRASEÑA
          </Text>
          <TextInput
            className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
            CONFIRMAR CONTRASEÑA
          </Text>
          <TextInput
            className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
            placeholder="Repite tu contraseña"
            placeholderTextColor="#94A3B8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? (
            <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
          ) : null}

          <Pressable
            className="mt-6 items-center rounded-xl bg-[#00A878] py-4"
            onPress={() => void handleRegister()}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-bold text-white">Crear cuenta</Text>
            )}
          </Pressable>

          <View className="mt-6 flex-row flex-wrap items-center justify-center">
            <Text className="text-sm text-[#94A3B8]">¿Ya tienes una cuenta? </Text>
            <Link href="/login" asChild>
              <Pressable hitSlop={8}>
                <Text className="text-sm font-bold text-[#00A878]">Inicia sesión aquí</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
