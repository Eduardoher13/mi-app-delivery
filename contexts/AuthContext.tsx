import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getMe,
  login as apiLogin,
  mapAuthUserToUser,
  register as apiRegister,
} from '../services/auth';
import { createClient } from '../services/clients';
import { updateUser } from '../services/users';
import { User } from '../types';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from '../utils/constants';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerCliente: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    city?: string;
  }) => Promise<User>;
  signOut: () => Promise<void>;
  updateAvatarUrl: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LEGACY_MOCK_TOKEN = 'mock-jwt-token-casaia';

function parseStoredUser(raw: string): User | null {
  try {
    const parsed = JSON.parse(raw) as User;
    if (!parsed.id || !parsed.email) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      avatarUrl: parsed.avatarUrl,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback(async (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

        if (!storedToken || storedToken === LEGACY_MOCK_TOKEN) {
          if (storedToken === LEGACY_MOCK_TOKEN) {
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
          }
          return;
        }

        setToken(storedToken);

        const storedUserRaw = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (storedUserRaw) {
          const storedUser = parseStoredUser(storedUserRaw);
          if (storedUser) {
            setUser(storedUser);
          }
        }

        const me = await getMe();
        const refreshedUser = mapAuthUserToUser(me);
        setUser(refreshedUser);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(refreshedUser));
      } catch {
        await clearSession();
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await apiLogin(email.trim(), password);
      const nextUser = mapAuthUserToUser(response.user);
      await persistSession(nextUser, response.access_token);
      return nextUser;
    },
    [persistSession],
  );

  const registerCliente = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      city?: string;
    }): Promise<User> => {
      const authUser = await apiRegister({
        email: input.email,
        password: input.password,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        role: 'cliente',
        phone: input.phone?.trim() || undefined,
        city: input.city?.trim() || undefined,
      });

      await createClient(authUser.id);

      const response = await apiLogin(input.email.trim(), input.password);
      const nextUser = mapAuthUserToUser(response.user);
      await persistSession(nextUser, response.access_token);
      return nextUser;
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
    router.replace('/login' as Href);
  }, [clearSession]);

  const updateAvatarUrl = useCallback(
    async (avatarUrl: string) => {
      if (!user) {
        return;
      }

      try {
        await updateUser(user.id, { avatar_url: avatarUrl });
      } catch {
        // Si falla el backend, al menos reflejamos el cambio en la sesión local.
      }

      const nextUser = { ...user, avatarUrl };
      setUser(nextUser);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      registerCliente,
      signOut,
      updateAvatarUrl,
    }),
    [
      user,
      token,
      loading,
      login,
      registerCliente,
      signOut,
      updateAvatarUrl,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
