import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { RegisterRequest } from '@finance-hub/shared-api-types';

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: ({ accessToken, user }) => setSession(accessToken, user),
  });
}
