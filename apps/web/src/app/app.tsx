import { AppRoutes } from './router';
import { useAuthBootstrap } from '../features/auth/hooks/use-auth-bootstrap';
import { ThemeProvider } from '../lib/theme';

export function App(): JSX.Element {
  const ready = useAuthBootstrap();
  return (
    <ThemeProvider>
      {!ready ? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <AppRoutes />
      )}
    </ThemeProvider>
  );
}

export default App;
