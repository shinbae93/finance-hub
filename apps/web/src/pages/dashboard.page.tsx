import { Button } from '@finance-hub/web-ui';
import { useNavigate, Link } from 'react-router-dom';
import { CurrentUserCard, useLogout } from '../features/auth';

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-12 px-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => logout(undefined, { onSettled: () => navigate('/login') })}
          data-testid="logout-button"
        >
          {isPending ? 'Signing out…' : 'Sign out'}
        </Button>
      </header>
      <CurrentUserCard />
      <nav className="flex gap-3">
        <Link
          to="/stocks"
          className="rounded border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Stocks →
        </Link>
      </nav>
    </div>
  );
}
