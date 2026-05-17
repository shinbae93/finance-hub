import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './theme-toggle';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useLogout } from '../features/auth';

export function TopNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { mutate: logout, isPending } = useLogout();

  function navLinkClass(path: string): string {
    const active = location.pathname === path;
    return `text-sm font-medium transition-colors ${
      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`;
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-border bg-background px-6">
      {/* Wordmark */}
      <Link to="/dashboard" className="mr-8 text-lg font-semibold text-primary">
        FinanceHub
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-6">
        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
          Dashboard
        </Link>
        <Link to="/stocks" className={navLinkClass('/stocks')}>
          Stocks
        </Link>
      </nav>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {accessToken && (
          <button
            disabled={isPending}
            onClick={() => logout(undefined, { onSettled: () => navigate('/login') })}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {isPending ? 'Signing out…' : 'Sign out'}
          </button>
        )}
      </div>
    </header>
  );
}
