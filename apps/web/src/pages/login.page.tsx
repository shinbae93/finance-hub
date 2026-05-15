import { AuthLayout, LoginForm } from '../features/auth';

export function LoginPage(): JSX.Element {
  return (
    <AuthLayout title="Sign in">
      <LoginForm />
    </AuthLayout>
  );
}
