import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@finance-hub/web-ui';

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
