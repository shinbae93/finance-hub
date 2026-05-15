import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './app/app';
import { createQueryClient } from './lib/query-client';
import { configureApiClient } from './lib/api-client';
import { useAuthStore } from './features/auth/store/auth.store';
import { authApi } from './features/auth/api/auth.api';
import './styles.css';

configureApiClient({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: async () => {
    try {
      const { accessToken } = await authApi.refresh();
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    } catch {
      useAuthStore.getState().clear();
      return null;
    }
  },
  onAuthFailure: () => useAuthStore.getState().clear(),
});

const queryClient = createQueryClient();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
