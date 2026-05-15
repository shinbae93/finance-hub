import { create } from 'zustand';
import type { UserDto } from '@finance-hub/shared-api-types';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  setSession: (accessToken: string, user: UserDto) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ accessToken: null, user: null }),
}));
