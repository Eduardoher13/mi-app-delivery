import api from './api';
import { parseListResponse } from './products';

export interface ServiceAssignment {
  id: string;
  service_request_id: string;
  service_offer_id: string;
  professional_id: string;
  client_id: string;
  final_price: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface CreateServiceAssignmentDto {
  service_request_id: string;
  service_offer_id: string;
  professional_id: string;
  client_id: string;
  final_price: number;
}

export async function createServiceAssignment(
  dto: CreateServiceAssignmentDto,
): Promise<ServiceAssignment> {
  const { data } = await api.post<ServiceAssignment>('/service-assignments', dto);
  return data;
}

export async function getServiceAssignments(options?: {
  limit?: number;
  offset?: number;
}): Promise<ServiceAssignment[]> {
  const params: Record<string, number> = {};
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/service-assignments', { params });
  const { items } = parseListResponse<ServiceAssignment>(data);
  return items;
}

export async function getAssignmentsForRequest(
  requestId: string,
): Promise<ServiceAssignment[]> {
  const all = await getServiceAssignments({ limit: 50 });
  return all.filter((assignment) => assignment.service_request_id === requestId);
}
