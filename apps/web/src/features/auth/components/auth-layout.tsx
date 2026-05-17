import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <p className="mb-6 text-2xl font-semibold text-primary">FinanceHub</p>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <h1 className="mb-6 text-xl font-semibold text-foreground">{title}</h1>
        {children}
      </div>
    </div>
  );
}
