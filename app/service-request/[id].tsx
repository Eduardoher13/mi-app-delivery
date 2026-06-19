import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceRequestTimeline } from '../../components/ServiceRequestTimeline';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { formatApiError } from '../../services/api';
import { getProfessionalById } from '../../services/professionals';
import { createServiceAssignment } from '../../services/serviceAssignments';
import {
  acceptServiceOffer,
  getOffersForServiceRequest,
  ServiceOffer,
} from '../../services/serviceOffers';
import {
  getServiceRequestById,
  resolveClientId,
  ServiceRequest,
  updateServiceRequest,
} from '../../services/serviceRequests';
import { getSpecialtyNameById } from '../../utils/constants';
import { isCliente } from '../../utils/roles';
import { serviceRequestStatusLabel } from '../../utils/serviceRequestStatus';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseOfferPrice(price: string | number): number {
  return typeof price === 'number' ? price : Number.parseFloat(price);
}

export default function ServiceRequestDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useRoleRedirect(isCliente);
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = typeof id === 'string' ? id : '';

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [proName, setProName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [data, requestOffers] = await Promise.all([
        getServiceRequestById(requestId),
        getOffersForServiceRequest(requestId),
      ]);

      setRequest(data);
      setOffers(requestOffers);

      if (requestOffers.length > 0) {
        try {
          const pro = await getProfessionalById(requestOffers[0].professional_id);
          setProName(pro.name);
        } catch {
          setProName(null);
        }
      } else {
        setProName(null);
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAcceptOffer = async (offer: ServiceOffer) => {
    if (!user || !request) {
      return;
    }

    setAccepting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const clientId = await resolveClientId(user);
      const price = parseOfferPrice(offer.price);

      await acceptServiceOffer(offer.id);
      await createServiceAssignment({
        service_request_id: request.id,
        service_offer_id: offer.id,
        professional_id: offer.professional_id,
        client_id: clientId,
        final_price: price,
      });
      const updated = await updateServiceRequest(request.id, { status: 'en_progreso' });

      setRequest(updated);
      setOffers((current) =>
        current.map((item) =>
          item.id === offer.id ? { ...item, is_accepted: true } : item,
        ),
      );
      setSuccessMessage('Cotización aceptada. El profesional comenzará el trabajo.');
    } catch (err) {
      setActionError(formatApiError(err, 'No se pudo aceptar la cotización'));
    } finally {
      setAccepting(false);
    }
  };

  const pendingOffer = offers.find((offer) => !offer.is_accepted);
  const acceptedOffer = offers.find((offer) => offer.is_accepted);
  const displayOffer = acceptedOffer ?? pendingOffer;
  const canAccept = request?.status === 'pendiente' && pendingOffer !== undefined;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-10 pt-2">
        <View className="flex-row items-center">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0]"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text className="text-lg font-black text-[#0F172A]">Detalle solicitud</Text>
        </View>

        {loading ? (
          <View className="my-10 items-center">
            <ActivityIndicator color="#1e3a8a" size="large" />
          </View>
        ) : error ? (
          <Text className="my-10 text-center text-sm text-red-600">{error}</Text>
        ) : request ? (
          <View className="mt-6">
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 text-xl font-black text-[#0F172A]">
                {request.title}
              </Text>
              {request.is_emergency ? (
                <View className="rounded-full bg-red-100 px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-red-600">URGENTE</Text>
                </View>
              ) : null}
            </View>

            <Text className="mt-2 text-sm font-semibold text-[#1e3a8a]">
              {serviceRequestStatusLabel(request.status)}
            </Text>
            <Text className="mt-1 text-xs text-[#94A3B8]">
              {getSpecialtyNameById(request.specialty_id)} · {formatDate(request.created_at)}
            </Text>

            <View className="mt-4">
              <ServiceRequestTimeline status={request.status} />
            </View>

            <View className="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                DESCRIPCIÓN
              </Text>
              <Text className="mt-2 text-sm leading-5 text-[#0F172A]">
                {request.description}
              </Text>
            </View>

            <View className="mt-4 rounded-2xl border border-[#E2E8F0] p-4">
              <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                DIRECCIÓN
              </Text>
              <Text className="mt-2 text-sm text-[#0F172A]">{request.address}</Text>
            </View>

            {displayOffer ? (
              <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-4">
                <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
                  COTIZACIÓN RECIBIDA
                </Text>
                {proName ? (
                  <Text className="mt-2 text-sm font-bold text-[#0F172A]">{proName}</Text>
                ) : null}
                <Text className="mt-2 text-2xl font-black text-[#1e3a8a]">
                  ${parseOfferPrice(displayOffer.price).toFixed(2)}
                </Text>
                {displayOffer.message ? (
                  <Text className="mt-2 text-sm text-[#0F172A]">{displayOffer.message}</Text>
                ) : null}
                {displayOffer.is_accepted ? (
                  <Text className="mt-3 text-xs font-semibold text-[#1e3a8a]">
                    Cotización aceptada
                  </Text>
                ) : null}
              </View>
            ) : request.status === 'pendiente' ? (
              <View className="mt-6 rounded-2xl border border-dashed border-[#E2E8F0] p-4">
                <Text className="text-center text-sm text-[#94A3B8]">
                  Esperando cotización de un profesional…
                </Text>
              </View>
            ) : null}

            {successMessage ? (
              <View className="mt-4 rounded-lg bg-[#1e3a8a]/10 px-3 py-3">
                <Text className="text-center text-sm font-semibold text-[#1e3a8a]">
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {actionError ? (
              <Text className="mt-4 text-center text-sm text-red-600">{actionError}</Text>
            ) : null}

            {canAccept && pendingOffer ? (
              <Pressable
                className="mt-6 items-center rounded-xl bg-[#1e3a8a] py-4"
                onPress={() => void handleAcceptOffer(pendingOffer)}
                disabled={accepting}
              >
                {accepting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-bold text-white">Aceptar cotización</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
