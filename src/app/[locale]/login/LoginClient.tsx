'use client';

import { AuthWrapper } from '../../../features/auth/components/AuthWrapper';
import { LoginForm } from '../../../features/auth/ui/LoginForm';

export function LoginClient() {
  return (
    <AuthWrapper requireGuest redirectTo='/dashboard'>
      <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
        <LoginForm />
      </div>
    </AuthWrapper>
  );
}
