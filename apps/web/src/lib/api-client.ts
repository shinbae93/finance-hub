import { env } from './env';

export interface ApiClientOptions extends RequestInit {
  json?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `Request failed with status ${status}`);
  }
}

type GetAccessToken = () => string | null;
type RefreshAccessToken = () => Promise<string | null>;
type OnAuthFailure = () => void;

let getAccessToken: GetAccessToken = () => null;
let refreshAccessToken: RefreshAccessToken = async () => null;
let onAuthFailure: OnAuthFailure = () => undefined;

export function configureApiClient(handlers: {
  getAccessToken: GetAccessToken;
  refreshAccessToken: RefreshAccessToken;
  onAuthFailure: OnAuthFailure;
}): void {
  getAccessToken = handlers.getAccessToken;
  refreshAccessToken = handlers.refreshAccessToken;
  onAuthFailure = handlers.onAuthFailure;
}

async function execute(path: string, init: ApiClientOptions, retried = false): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.json !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });

  if (response.status === 401 && !retried && path !== '/auth/refresh' && path !== '/auth/login') {
    const newToken = await refreshAccessToken();
    if (newToken) return execute(path, init, true);
    onAuthFailure();
  }

  return response;
}

export async function request<T>(path: string, init: ApiClientOptions = {}): Promise<T> {
  const response = await execute(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
