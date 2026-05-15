import { Link } from 'react-router-dom';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/dashboard" className="underline">
        Back to dashboard
      </Link>
    </div>
  );
}
