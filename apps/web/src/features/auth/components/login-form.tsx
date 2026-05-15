import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { Button, Input, Label } from '@finance-hub/web-ui';
import { useLogin } from '../hooks/use-login';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm(): JSX.Element {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useLogin();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit((values) =>
    mutate(values, { onSuccess: () => navigate('/dashboard') }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register('password')}
        />
      </div>
      {error && <p className="text-sm text-destructive">Invalid email or password.</p>}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
      <p className="text-sm text-muted-foreground">
        No account?{' '}
        <Link to="/register" className="underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
