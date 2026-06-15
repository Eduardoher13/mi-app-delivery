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
