import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function SplashGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  return children;
}
