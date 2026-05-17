import type { ReactNode } from 'react';
import { TopNav } from './top-nav';

export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
