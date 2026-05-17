import { Link } from 'react-router-dom';
import { CurrentUserCard } from '../features/auth';

export function DashboardPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <CurrentUserCard />
      <nav className="flex gap-3">
        <Link
          to="/stocks"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Stocks →
        </Link>
      </nav>
    </div>
  );
}
