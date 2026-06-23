import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatApiError } from '../services/api';
import {
  getProfessionalByUserId,
  updateProfessional,
} from '../services/professionals';
import { CORDOBA_SYMBOL } from '../utils/currency';

interface ProfessionalProfileEditorProps {
  userId: string;
}

export function ProfessionalProfileEditor({ userId }: ProfessionalProfileEditorProps) {
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const professional = await getProfessionalByUserId(userId);
      setProfessionalId(professional.id);
      setBio((professional.bio ?? '').trim());
      setBasePrice(professional.base_price);
      setIsAvailable(professional.is_available);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!professionalId) {
      return;
    }

    const price = Number.parseFloat(basePrice);
    if (!Number.isFinite(price) || price <= 0) {
      setError('Ingresa una tarifa base válida.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfessional(professionalId, {
        bio: bio.trim(),
        base_price: price,
        is_available: isAvailable,
      });
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="mt-6 items-center rounded-2xl border border-[#E2E8F0] p-6">
        <ActivityIndicator color="#1e3a8a" />
      </View>
    );
  }

  return (
    <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <Text className="text-sm font-black text-[#0F172A]">Mi perfil profesional</Text>

      <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
        BIO
      </Text>
      <TextInput
        className="min-h-[90px] rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A]"
        placeholder="Describe tu experiencia..."
        placeholderTextColor="#94A3B8"
        value={bio}
        onChangeText={setBio}
        multiline
        textAlignVertical="top"
      />

      <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
        TARIFA BASE ({CORDOBA_SYMBOL}/hr)
      </Text>
      <TextInput
        className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A]"
        placeholder="1500.00"
        placeholderTextColor="#94A3B8"
        value={basePrice}
        onChangeText={setBasePrice}
        keyboardType="decimal-pad"
      />

      <View className="mt-4 flex-row items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
        <Text className="text-sm font-bold text-[#0F172A]">Disponible para trabajos</Text>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: '#E2E8F0', true: '#1e3a8a' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {error ? <Text className="mt-3 text-center text-xs text-red-600">{error}</Text> : null}
      {success ? (
        <Text className="mt-3 text-center text-xs text-[#1e3a8a]">{success}</Text>
      ) : null}

      <Pressable
        className="mt-4 items-center rounded-xl bg-[#1e3a8a] py-3"
        onPress={() => void handleSave()}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-sm font-bold text-white">Guardar cambios</Text>
        )}
      </Pressable>
    </View>
  );
}
