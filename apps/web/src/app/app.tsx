import { AppRoutes } from './router';
import { useAuthBootstrap } from '../features/auth/hooks/use-auth-bootstrap';

export function App(): JSX.Element {
  const ready = useAuthBootstrap();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  return <AppRoutes />;
}

export default App;
