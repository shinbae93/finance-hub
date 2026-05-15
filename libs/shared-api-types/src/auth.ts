import type { IsoDateString } from './common';

export interface UserDto {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: IsoDateString;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  user: UserDto;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}
