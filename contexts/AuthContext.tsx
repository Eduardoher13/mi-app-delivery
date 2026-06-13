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
import { AUTH_TOKEN_KEY, MOCK_USER } from '../utils/constants';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_TOKEN = 'mock-jwt-token-casaia';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          setUser({ id: MOCK_USER.id, name: MOCK_USER.name });
        } else {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
          setToken(MOCK_TOKEN);
          setUser({ id: MOCK_USER.id, name: MOCK_USER.name });
        }
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signOut }),
    [user, token, loading, signOut],
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
