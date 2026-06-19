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
