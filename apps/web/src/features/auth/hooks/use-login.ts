import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginRequest } from '@finance-hub/shared-api-types';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: ({ accessToken, user }) => setSession(accessToken, user),
  });
}
