import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { Button, Input, Label } from '@finance-hub/web-ui';
import { useRegister } from '../hooks/use-register';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm(): JSX.Element {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useRegister();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit((values) =>
    mutate(values, { onSuccess: () => navigate('/dashboard') }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name (optional)</Label>
        <Input id="fullName" type="text" autoComplete="name" {...form.register('fullName')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register('password')}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">Could not create account. Try a different email.</p>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
      <p className="text-sm text-muted-foreground">
        Have an account?{' '}
        <Link to="/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
