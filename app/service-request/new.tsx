import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { formatApiError } from '../../services/api';
import { getSpecialtyBySlug } from '../../services/specialties';
import {
  createServiceRequest,
  resolveClientId,
} from '../../services/serviceRequests';
import { CATEGORIES } from '../../utils/constants';

function parseBoolParam(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) {
    return value[0] === 'true';
  }

  return value === 'true';
}

function parseStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function NewServiceRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    specialtySlug?: string;
    professionalId?: string;
    isEmergency?: string;
  }>();

  const initialSlug = parseStringParam(params.specialtySlug);
  const professionalId = parseStringParam(params.professionalId);
  const initialEmergency = parseBoolParam(params.isEmergency);

  const { coords, requestPermission } = useLocation();

  const [selectedSlug, setSelectedSlug] = useState(initialSlug || CATEGORIES[0]?.slug || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isEmergency, setIsEmergency] = useState(initialEmergency);
  const [preferredDate, setPreferredDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    setIsEmergency(initialEmergency);
  }, [initialEmergency]);

  const handleUseLocation = useCallback(async () => {
    await requestPermission();
    setAddress(`Managua, Nicaragua (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
  }, [coords.latitude, coords.longitude, requestPermission]);

  const validate = (): boolean => {
    if (!selectedSlug) {
      setValidationError('Selecciona una categoría.');
      return false;
    }

    if (!title.trim()) {
      setValidationError('El título es obligatorio.');
      return false;
    }

    if (!description.trim()) {
      setValidationError('La descripción es obligatoria.');
      return false;
    }

    if (!address.trim()) {
      setValidationError('La dirección es obligatoria.');
      return false;
    }

    if (title.trim().length > 200) {
      setValidationError('El título no puede superar 200 caracteres.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const clientId = await resolveClientId(user);

      const specialty = await getSpecialtyBySlug(selectedSlug);

      const preferredDateIso = preferredDate.trim()
        ? new Date(`${preferredDate.trim()}T10:00:00`).toISOString()
        : undefined;

      const created = await createServiceRequest({
        client_id: clientId,
        specialty_id: specialty.id,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        is_emergency: isEmergency,
        preferred_date: preferredDateIso,
      });

      setSuccessId(created.id);
    } catch (err) {
      setError(formatApiError(err, 'No se pudo enviar la solicitud'));
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#00A878]/10">
            <Ionicons name="checkmark-circle" size={48} color="#00A878" />
          </View>
          <Text className="text-center text-xl font-black text-[#0F172A]">
            Solicitud enviada
          </Text>
          <Text className="mt-2 text-center text-sm text-[#94A3B8]">
            Tu solicitud fue registrada correctamente. Un profesional podrá revisarla pronto.
          </Text>
          <Pressable
            className="mt-8 w-full items-center rounded-xl bg-[#00A878] py-4"
            onPress={() => router.replace('/service-requests')}
          >
            <Text className="text-sm font-bold text-white">Ver mis solicitudes</Text>
          </Pressable>
          <Pressable
            className="mt-3 w-full items-center rounded-xl border border-[#E2E8F0] py-4"
            onPress={() => router.back()}
          >
            <Text className="text-sm font-bold text-[#0F172A]">Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text className="text-lg font-black text-[#0F172A]">Solicitar servicio</Text>
        </View>

        {professionalId ? (
          <Text className="mt-3 text-xs text-[#94A3B8]">
            Referencia profesional: {professionalId.slice(0, 8)}…
          </Text>
        ) : null}

        <Text className="mb-2 mt-6 text-xs font-semibold tracking-widest text-[#94A3B8]">
          CATEGORÍA
        </Text>
        <View className="flex-row flex-wrap">
          {CATEGORIES.map((category) => {
            const selected = selectedSlug === category.slug;

            return (
              <Pressable
                key={category.id}
                className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                  selected
                    ? 'border-[#00A878] bg-[#00A878]'
                    : 'border-[#E2E8F0] bg-white'
                }`}
                onPress={() => setSelectedSlug(category.slug)}
              >
                <Text
                  className={`text-xs font-bold ${
                    selected ? 'text-white' : 'text-[#0F172A]'
                  }`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
          TÍTULO
        </Text>
        <TextInput
          className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
          placeholder="Ej: Fuga en cocina"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
          DESCRIPCIÓN
        </Text>
        <TextInput
          className="min-h-[100px] rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
          placeholder="Describe el problema con detalle..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
          DIRECCIÓN
        </Text>
        <TextInput
          className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
          placeholder="Col. Centro, Managua"
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={setAddress}
        />
        <Pressable
          className="mt-2 self-start rounded-lg border border-[#E2E8F0] px-3 py-2"
          onPress={() => void handleUseLocation()}
        >
          <Text className="text-xs font-bold text-[#00A878]">Usar mi ubicación</Text>
        </Pressable>

        <View className="mt-6 flex-row items-center justify-between rounded-xl border border-[#E2E8F0] px-4 py-3">
          <View>
            <Text className="text-sm font-bold text-[#0F172A]">Urgencia / emergencia</Text>
            <Text className="text-xs text-[#94A3B8]">Marcar si requiere atención inmediata</Text>
          </View>
          <Switch
            value={isEmergency}
            onValueChange={setIsEmergency}
            trackColor={{ false: '#E2E8F0', true: '#00A878' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
          FECHA PREFERIDA (OPCIONAL)
        </Text>
        <TextInput
          className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          value={preferredDate}
          onChangeText={setPreferredDate}
          autoCapitalize="none"
        />

        {validationError ? (
          <Text className="mt-4 text-center text-sm text-red-600">{validationError}</Text>
        ) : null}
        {error ? (
          <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
        ) : null}

        <Pressable
          className="mt-6 items-center rounded-xl bg-[#00A878] py-4"
          onPress={() => void handleSubmit()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-bold text-white">Enviar solicitud</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
