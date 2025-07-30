import { requireGuest } from '@/shared/lib/auth-server';
import { RegisterClient } from './RegisterClient';

export default async function RegisterPage() {
  // Redirect to dashboard if already authenticated
  await requireGuest();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{' '}
            <a
              href='/login'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <RegisterClient />
      </div>
    </div>
  );
}
