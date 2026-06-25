import { getClientByUserId } from './clients';
import api from './api';
import { parseListResponse } from './products';

import { User } from '../types';

export interface CreateServiceRequestDto {
  client_id: string;
  specialty_id: number;
  title: string;
  description: string;
  address: string;
  status?: string;
  is_emergency?: boolean;
  preferred_date?: string;
}

export interface ServiceRequest {
  id: string;
  client_id: string;
  specialty_id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  is_emergency: boolean;
  preferred_date?: string | null;
  created_at: string;
}

export async function resolveClientIdForUser(userId: string): Promise<string> {
  const client = await getClientByUserId(userId);
  return client.id;
}

/** Requiere sesión de cliente válida. */
export async function resolveClientId(user?: User | null): Promise<string> {
  if (user?.role === 'cliente' && user.id) {
    return resolveClientIdForUser(user.id);
  }

  throw new Error('Debes iniciar sesión como cliente para continuar');
}

export async function createServiceRequest(
  dto: CreateServiceRequestDto,
): Promise<ServiceRequest> {
  const { data } = await api.post<ServiceRequest>('/service-requests', dto);
  return data;
}

export async function getServiceRequests(options?: {
  limit?: number;
  offset?: number;
}): Promise<ServiceRequest[]> {
  const params: Record<string, number> = {};

  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/service-requests', { params });
  const { items } = parseListResponse<ServiceRequest>(data);
  return items;
}

export async function getServiceRequestsForClient(
  clientId: string,
  options?: { limit?: number; offset?: number },
): Promise<ServiceRequest[]> {
  const all = await getServiceRequests(options);
  return all.filter((request) => request.client_id === clientId);
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest> {
  const { data } = await api.get<ServiceRequest>(`/service-requests/${id}`);
  return data;
}

export async function getServiceRequestsForProfessional(
  specialtyIds: number[],
  options?: { limit?: number },
): Promise<ServiceRequest[]> {
  if (specialtyIds.length === 0) {
    return [];
  }

  const specialtySet = new Set(specialtyIds.map((id) => Number(id)));
  const all = await getServiceRequests({ limit: options?.limit ?? 50 });
  return all.filter((request) => specialtySet.has(Number(request.specialty_id)));
}

export async function updateServiceRequest(
  id: string,
  dto: { status?: string },
): Promise<ServiceRequest> {
  const { data } = await api.patch<ServiceRequest>(`/service-requests/${id}`, dto);
  return data;
}
