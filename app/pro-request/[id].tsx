import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceRequestTimeline } from '../../components/ServiceRequestTimeline';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { formatApiError } from '../../services/api';
import { getAssignmentsForRequest } from '../../services/serviceAssignments';
import { getProfessionalByUserId } from '../../services/professionals';
import {
  createServiceOffer,
  getOffersForServiceRequest,
  ServiceOffer,
} from '../../services/serviceOffers';
import {
  getServiceRequestById,
  ServiceRequest,
  updateServiceRequest,
} from '../../services/serviceRequests';
import { getSpecialtyNameById } from '../../utils/constants';
import { isProfesional } from '../../utils/roles';
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

export default function ProRequestDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  useRoleRedirect(isProfesional);
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = typeof id === 'string' ? id : '';

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [myOffer, setMyOffer] = useState<ServiceOffer | null>(null);
  const [myProfessionalId, setMyProfessionalId] = useState<string | null>(null);
  const [assignedProId, setAssignedProId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    if (!requestId || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [data, professional, offers, assignments] = await Promise.all([
        getServiceRequestById(requestId),
        getProfessionalByUserId(user.id),
        getOffersForServiceRequest(requestId),
        getAssignmentsForRequest(requestId),
      ]);

      setRequest(data);
      setMyProfessionalId(professional.id);
      const existing = offers.find((offer) => offer.professional_id === professional.id);
      setMyOffer(existing ?? null);
      setAssignedProId(assignments[0]?.professional_id ?? null);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [requestId, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmitOffer = async () => {
    if (!user?.id || !request) {
      return;
    }

    const price = Number.parseFloat(priceInput.replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) {
      setSubmitError('Ingresa un precio mayor a 0');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const professional = await getProfessionalByUserId(user.id);
      const offer = await createServiceOffer({
        service_request_id: request.id,
        professional_id: professional.id,
        price,
        message: messageInput.trim() || undefined,
      });
      setMyOffer(offer);
      setPriceInput('');
      setMessageInput('');
    } catch (err) {
      setSubmitError(formatApiError(err, 'No se pudo enviar la cotización'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!request) {
      return;
    }

    setCompleting(true);
    setSubmitError(null);

    try {
      const updated = await updateServiceRequest(request.id, { status: 'completado' });
      setRequest(updated);
    } catch (err) {
      setSubmitError(formatApiError(err, 'No se pudo marcar como completado'));
    } finally {
      setCompleting(false);
    }
  };

  const isAssignedPro =
    myProfessionalId !== null &&
    assignedProId !== null &&
    myProfessionalId === assignedProId;
  const canQuote = request?.status === 'pendiente' && !myOffer;
  const canComplete =
    request?.status === 'en_progreso' &&
    (isAssignedPro || myOffer?.is_accepted === true);

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

            {myOffer ? (
              <View className="mt-6 rounded-2xl border border-[#1e3a8a]/30 bg-[#1e3a8a]/5 p-4">
                <Text className="text-xs font-semibold tracking-widest text-[#1e3a8a]">
                  TU COTIZACIÓN
                </Text>
                <Text className="mt-2 text-2xl font-black text-[#0F172A]">
                  ${parseOfferPrice(myOffer.price).toFixed(2)}
                </Text>
                {myOffer.message ? (
                  <Text className="mt-2 text-sm text-[#0F172A]">{myOffer.message}</Text>
                ) : null}
                <Text className="mt-2 text-xs text-[#94A3B8]">
                  {myOffer.is_accepted ? 'Aceptada por el cliente' : 'Esperando respuesta del cliente'}
                </Text>
              </View>
            ) : canQuote ? (
              <View className="mt-6 rounded-2xl border border-[#E2E8F0] p-4">
                <Text className="text-sm font-bold text-[#0F172A]">Enviar cotización</Text>
                <Text className="mt-1 text-xs text-[#94A3B8]">
                  Indica el precio por el servicio
                </Text>
                <TextInput
                  className="mt-4 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A]"
                  placeholder="Precio (ej: 45.00)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={priceInput}
                  onChangeText={setPriceInput}
                />
                <TextInput
                  className="mt-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A]"
                  placeholder="Mensaje opcional"
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={messageInput}
                  onChangeText={setMessageInput}
                />
                {submitError ? (
                  <Text className="mt-3 text-center text-xs text-red-600">{submitError}</Text>
                ) : null}
                <Pressable
                  className="mt-4 items-center rounded-xl bg-[#1e3a8a] py-4"
                  onPress={() => void handleSubmitOffer()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-sm font-bold text-white">Enviar cotización</Text>
                  )}
                </Pressable>
              </View>
            ) : null}

            {canComplete ? (
              <Pressable
                className="mt-4 items-center rounded-xl bg-[#0F172A] py-4"
                onPress={() => void handleMarkComplete()}
                disabled={completing}
              >
                {completing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-bold text-white">Marcar como completado</Text>
                )}
              </Pressable>
            ) : null}

            {submitError && !canQuote ? (
              <Text className="mt-3 text-center text-xs text-red-600">{submitError}</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
