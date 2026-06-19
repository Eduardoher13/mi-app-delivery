import api from './api';

export interface ApiClient {
  id: string;
  user_id: string;
  address?: string | null;
  points_balance?: number;
}

export async function getClientById(id: string): Promise<ApiClient> {
  const { data } = await api.get<ApiClient>(`/clients/${id}`);
  return data;
}

export async function getClientByUserId(userId: string): Promise<ApiClient> {
  const { data } = await api.get<ApiClient>(`/clients/by-user/${userId}`);
  return data;
}

export async function createClient(userId: string, address?: string): Promise<ApiClient> {
  const { data } = await api.post<ApiClient>('/clients', {
    user_id: userId,
    address: address ?? null,
    points_balance: 0,
  });
  return data;
}
