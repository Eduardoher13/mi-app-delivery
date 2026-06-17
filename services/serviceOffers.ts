import api from './api';
import { parseListResponse } from './products';

export interface ServiceOffer {
  id: string;
  service_request_id: string;
  professional_id: string;
  price: string;
  message: string | null;
  is_accepted: boolean;
  created_at: string;
}

export interface CreateServiceOfferDto {
  service_request_id: string;
  professional_id: string;
  price: number;
  message?: string;
}

/** BD: service_request_id es UNIQUE — solo una cotización por solicitud en total. */
export async function createServiceOffer(
  dto: CreateServiceOfferDto,
): Promise<ServiceOffer> {
  const { data } = await api.post<ServiceOffer>('/service-offers', dto);
  return data;
}

export async function getServiceOffers(options?: {
  limit?: number;
  offset?: number;
}): Promise<ServiceOffer[]> {
  const params: Record<string, number> = {};
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/service-offers', { params });
  const { items } = parseListResponse<ServiceOffer>(data);
  return items;
}

export async function getServiceOfferById(id: string): Promise<ServiceOffer> {
  const { data } = await api.get<ServiceOffer>(`/service-offers/${id}`);
  return data;
}

export async function getOffersForServiceRequest(
  requestId: string,
): Promise<ServiceOffer[]> {
  const all = await getServiceOffers({ limit: 50 });
  return all.filter((offer) => offer.service_request_id === requestId);
}

export async function acceptServiceOffer(id: string): Promise<ServiceOffer> {
  const { data } = await api.patch<ServiceOffer>(`/service-offers/${id}`, {
    is_accepted: true,
  });
  return data;
}
