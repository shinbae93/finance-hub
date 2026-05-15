import { useEffect, useRef, useState } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useAuthBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  // useRef guards against StrictMode double-invoke firing two /auth/refresh POSTs in dev.
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    // Already have a token in memory (same-session navigation) — skip network round-trips.
    if (useAuthStore.getState().accessToken) {
      setReady(true);
      return;
    }

    authApi
      .refresh()
      .then(async ({ accessToken }) => {
        useAuthStore.getState().setAccessToken(accessToken);
        // Hydrate user so components reading store.user don't see null after hard-refresh.
        const user = await authApi.me();
        useAuthStore.getState().setSession(accessToken, user);
      })
      .catch(() => {
        // No valid refresh cookie — start unauthenticated.
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  return ready;
}
