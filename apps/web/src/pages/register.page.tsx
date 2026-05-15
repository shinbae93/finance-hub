import { AuthLayout, RegisterForm } from '../features/auth';

export function RegisterPage(): JSX.Element {
  return (
    <AuthLayout title="Create account">
      <RegisterForm />
    </AuthLayout>
  );
}
