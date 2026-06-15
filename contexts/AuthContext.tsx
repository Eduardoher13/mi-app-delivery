import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { User } from '../types';
import { getUserByEmail } from '../services/users';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  DEMO_EMPRESA_EMAIL,
  MOCK_USER,
} from '../utils/constants';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateAvatarUrl: (avatarUrl: string) => Promise<void>;
  loginAsEmpresaDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_TOKEN = 'mock-jwt-token-casaia';

function defaultUser(): User {
  return { id: MOCK_USER.id, name: MOCK_USER.name };
}

async function loadStoredUser(): Promise<User> {
  const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return defaultUser();
  }

  try {
    const parsed = JSON.parse(raw) as User;
    return {
      id: parsed.id ?? MOCK_USER.id,
      name: parsed.name ?? MOCK_USER.name,
      email: parsed.email,
      role: parsed.role,
      avatarUrl: parsed.avatarUrl,
    };
  } catch {
    return defaultUser();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = await loadStoredUser();

        if (storedToken) {
          setToken(storedToken);
        } else {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
          setToken(MOCK_TOKEN);
        }

        setUser(storedUser);
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, []);

  const persistUser = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const updateAvatarUrl = useCallback(
    async (avatarUrl: string) => {
      const base = user ?? defaultUser();
      await persistUser({ ...base, avatarUrl });
    },
    [persistUser, user],
  );

  const loginAsEmpresaDemo = useCallback(async () => {
    const apiUser = await getUserByEmail(DEMO_EMPRESA_EMAIL);
    await persistUser({
      id: apiUser.id,
      name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
      email: apiUser.email,
      role: apiUser.role,
      avatarUrl: apiUser.avatar_url ?? undefined,
    });
  }, [persistUser]);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signOut, updateAvatarUrl, loginAsEmpresaDemo }),
    [user, token, loading, signOut, updateAvatarUrl, loginAsEmpresaDemo],
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
