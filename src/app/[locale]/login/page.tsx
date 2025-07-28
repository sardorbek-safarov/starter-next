import { requireGuest } from '../../../shared/lib/auth-server';
import { LoginClient } from './LoginClient';

export default async function LoginPage() {
  // Redirect to dashboard if already authenticated
  await requireGuest();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
        </div>
        <LoginClient />
      </div>
    </div>
  );
}
