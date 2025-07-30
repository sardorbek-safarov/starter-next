'use client';

import { AuthWrapper, RegisterForm } from '@/features';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function RegisterClient() {
  const t = useTranslations('Auth');

  return (
    <AuthWrapper requireGuest redirectTo='/'>
      <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
        <RegisterForm />

        <div className='mt-6'>
          <div className='text-center'>
            <span className='text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                {t('login.title')}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
