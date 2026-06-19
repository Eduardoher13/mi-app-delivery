import api from './api';

export interface ApiUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
}

export async function getUserByEmail(email: string): Promise<ApiUser> {
  const { data } = await api.get<ApiUser>(
    `/users/by-email/${encodeURIComponent(email)}`,
  );
  return data;
}

export async function getUserById(id: string): Promise<ApiUser> {
  const { data } = await api.get<ApiUser>(`/users/${id}`);
  return data;
}

export function formatUserName(user: Pick<ApiUser, 'first_name' | 'last_name'>): string {
  return `${user.first_name} ${user.last_name}`.trim() || 'Cliente';
}

export async function updateUser(
  id: string,
  dto: Partial<Pick<ApiUser, 'avatar_url' | 'first_name' | 'last_name'>>,
): Promise<ApiUser> {
  const { data } = await api.patch<ApiUser>(`/users/${id}`, dto);
  return data;
}
