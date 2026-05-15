import { Card, CardContent, CardHeader, CardTitle } from '@finance-hub/web-ui';
import { useMe } from '../hooks/use-me';

export function CurrentUserCard(): JSX.Element {
  const { data, isLoading } = useMe();
  if (isLoading) return <p>Loading…</p>;
  if (!data) return <p>Not signed in.</p>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signed in as</CardTitle>
      </CardHeader>
      <CardContent>
        <p data-testid="current-user-email" className="text-base">
          {data.email}
        </p>
        {data.fullName && <p className="text-sm text-muted-foreground">{data.fullName}</p>}
      </CardContent>
    </Card>
  );
}
