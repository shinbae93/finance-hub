import { AppRoutes } from './router';
import { useAuthBootstrap } from '../features/auth/hooks/use-auth-bootstrap';

export function App(): JSX.Element {
  const ready = useAuthBootstrap();
  if (!ready) return <></>;
  return <AppRoutes />;
}

export default App;
