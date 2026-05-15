import { useEffect, useRef, useState } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useAuthBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    // If we already have a token in memory (e.g. same-session navigation), skip.
    if (useAuthStore.getState().accessToken) {
      setReady(true);
      return;
    }

    authApi
      .refresh()
      .then(({ accessToken }) => {
        useAuthStore.getState().setAccessToken(accessToken);
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
