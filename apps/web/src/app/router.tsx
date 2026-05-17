import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';
import { StocksPage } from '../pages/stocks.page';
import { CashPage } from '../pages/cash.page';
import { GoldPage } from '../pages/gold.page';
import { NotFoundPage } from '../pages/not-found.page';
import { ProtectedRoute } from '../features/auth/guards/protected-route';
import { AppShell } from '../components/app-shell';

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stocks"
        element={
          <ProtectedRoute>
            <AppShell>
              <StocksPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cash"
        element={
          <ProtectedRoute>
            <AppShell>
              <CashPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gold"
        element={
          <ProtectedRoute>
            <AppShell>
              <GoldPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
