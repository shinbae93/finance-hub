import type {
  AuthSession,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
  UserDto,
} from '@finance-hub/shared-api-types';
import { request } from '../../../lib/api-client';

export const authApi = {
  register: (body: RegisterRequest) =>
    request<AuthSession>('/auth/register', { method: 'POST', json: body }),
  login: (body: LoginRequest) =>
    request<AuthSession>('/auth/login', { method: 'POST', json: body }),
  refresh: () => request<RefreshResponse>('/auth/refresh', { method: 'POST' }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<UserDto>('/users/me'),
};
