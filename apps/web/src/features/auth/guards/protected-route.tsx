import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
