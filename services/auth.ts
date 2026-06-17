import AsyncStorage from '@react-native-async-storage/async-storage';

import api from './api';
import { User } from '../types';
import { AUTH_TOKEN_KEY } from '../utils/constants';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export function mapAuthUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.email,
    email: authUser.email,
    role: authUser.role,
    avatarUrl: authUser.avatar_url ?? undefined,
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}
