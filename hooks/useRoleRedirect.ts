import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { getDefaultTabHref } from '../utils/roles';

/** Redirige al tab del rol si el usuario no tiene permiso para esta pantalla. */
export function useRoleRedirect(allowed: (role?: string) => boolean): void {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user?.role) {
      return;
    }

    if (!allowed(user.role)) {
      router.replace(getDefaultTabHref(user.role));
    }
  }, [allowed, loading, router, user?.role]);
}
