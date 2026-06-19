import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LocationMap } from '../../components/LocationMap';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { PhoneInput } from '../../components/PhoneInput';
import { useCart } from '../../contexts/CartContext';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { formatApiError } from '../../services/api';
import { getClientByUserId } from '../../services/clients';
import { checkoutCart } from '../../services/orders';
import { resolveClientId } from '../../services/serviceRequests';
import { OrderDeliveryDetails } from '../../types/checkout';
import { MANAGUA_COORDS } from '../../utils/constants';
import { getFastMapCoords, warmUpDeviceLocation } from '../../utils/deviceLocation';
import { getPhoneValidationMessage, isValidAppPhone } from '../../utils/phoneFormat';
import { isCliente } from '../../utils/roles';

export default function CartCheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useRoleRedirect(isCliente);

  const { lines, subtotal, clearCart } = useCart();
  const orderSubmittedRef = useRef(false);

  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mapCoords, setMapCoords] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locatingMap, setLocatingMap] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void warmUpDeviceLocation();
  }, []);

  useEffect(() => {
    if (orderSubmittedRef.current) {
      return;
    }

    if (lines.length === 0) {
      router.replace('/cart' as Href);
    }
  }, [lines.length, router]);

  useEffect(() => {
    if (!user) {
      setPrefillLoading(false);
      return;
    }

    let cancelled = false;

    async function prefill() {
      setContactName(user!.name);

      try {
        const client = await getClientByUserId(user!.id);
        if (!cancelled && client.address?.trim()) {
          setAddress(client.address.trim());
        }
      } catch {
        // Sin perfil de cliente aún
      } finally {
        if (!cancelled) {
          setPrefillLoading(false);
        }
      }
    }

    void prefill();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleUseLocation = useCallback(async () => {
    setLocatingMap(true);
    setValidationError(null);

    try {
      const coords = await getFastMapCoords();
      setMapCoords(coords);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'No se pudo obtener tu ubicación. Revisa los permisos del teléfono.',
      );
    } finally {
      setLocatingMap(false);
    }
  }, []);

  const validate = (): boolean => {
    if (!contactName.trim()) {
      setValidationError('Tu nombre es obligatorio.');
      return false;
    }

    if (!phone.trim() || !isValidAppPhone(phone)) {
      setValidationError(getPhoneValidationMessage());
      return false;
    }

    if (!address.trim()) {
      setValidationError('La dirección de entrega es obligatoria.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleConfirm = async () => {
    if (!user || lines.length === 0 || !validate()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const deliveryDetails: OrderDeliveryDetails = {
      contactName: contactName.trim(),
      phone,
      address: address.trim(),
      latitude: mapCoords?.latitude,
      longitude: mapCoords?.longitude,
    };

    try {
      const clientId = await resolveClientId(user);
      const { order, deliveryId } = await checkoutCart(clientId, lines, deliveryDetails);

      orderSubmittedRef.current = true;
      router.replace({
        pathname: '/order/[id]',
        params: {
          id: order.id,
          total: order.total,
          status: order.status,
          deliveryId: deliveryId ?? '',
        },
      });
      await clearCart();
    } catch (err) {
      setError(formatApiError(err, 'No se pudo confirmar el pedido'));
    } finally {
      setSubmitting(false);
    }
  };

  const mapLatitude = mapCoords?.latitude ?? MANAGUA_COORDS.latitude;
  const mapLongitude = mapCoords?.longitude ?? MANAGUA_COORDS.longitude;

  if (lines.length === 0) {
    return null;
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
          <View className="flex-1">
            <Text className="text-lg font-black text-[#0F172A]">Datos de entrega</Text>
            <Text className="text-xs text-[#94A3B8]">Paso 2 de 2 · Pedido para ahora</Text>
          </View>
        </View>

        <View className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3">
          <Text className="text-xs text-[#94A3B8]">Subtotal del pedido</Text>
          <Text className="text-lg font-black text-[#1e3a8a]">${subtotal.toFixed(2)}</Text>
        </View>

        {prefillLoading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator color="#1e3a8a" />
          </View>
        ) : (
          <>
            <Text className="mb-2 mt-6 text-xs font-semibold tracking-widest text-[#94A3B8]">
              NOMBRE COMPLETO
            </Text>
            <TextInput
              className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
              placeholder="Ej: María González"
              placeholderTextColor="#94A3B8"
              value={contactName}
              onChangeText={setContactName}
              autoCapitalize="words"
            />

            <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
              TELÉFONO
            </Text>
            <PhoneInput value={phone} onChangeValue={setPhone} />

            <Text className="mb-2 mt-4 text-xs font-semibold tracking-widest text-[#94A3B8]">
              DIRECCIÓN DE ENTREGA
            </Text>
            <TextInput
              className="min-h-[80px] rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A]"
              placeholder="Colonia, referencias, número de casa..."
              placeholderTextColor="#94A3B8"
              value={address}
              onChangeText={setAddress}
              multiline
              textAlignVertical="top"
            />

            <Text className="mb-2 mt-6 text-xs font-semibold tracking-widest text-[#94A3B8]">
              UBICACIÓN EN MAPA (OPCIONAL)
            </Text>
            <Text className="mb-3 text-xs text-[#94A3B8]">
              Ayuda al repartidor a encontrarte. Puedes omitirlo si ya describiste bien la dirección.
            </Text>

            <LocationMap
              latitude={mapLatitude}
              longitude={mapLongitude}
              height={180}
              title="Entrega"
              showMarker={Boolean(mapCoords)}
            />

            <Pressable
              className="mt-2 flex-row items-center self-start rounded-lg border border-[#E2E8F0] px-3 py-2"
              onPress={() => void handleUseLocation()}
              disabled={locatingMap}
            >
              {locatingMap ? (
                <ActivityIndicator size="small" color="#1e3a8a" />
              ) : null}
              <Text className={`text-xs font-bold text-[#1e3a8a] ${locatingMap ? 'ml-2' : ''}`}>
                {locatingMap ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
              </Text>
            </Pressable>

            {mapCoords ? (
              <Pressable
                className="mt-2 self-start px-1 py-1"
                onPress={() => setMapCoords(null)}
              >
                <Text className="text-xs font-semibold text-[#94A3B8]">Quitar ubicación del mapa</Text>
              </Pressable>
            ) : null}
          </>
        )}

        {validationError ? (
          <Text className="mt-4 text-center text-sm text-red-600">{validationError}</Text>
        ) : null}
        {error ? (
          <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
        ) : null}

        <Pressable
          className="mt-6 items-center rounded-xl bg-[#1e3a8a] py-4"
          onPress={() => void handleConfirm()}
          disabled={submitting || prefillLoading}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-bold text-white">Confirmar pedido</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
