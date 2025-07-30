'use client';

import { LoginForm } from '@/features/auth/ui/LoginForm';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function LoginClient() {
  const t = useTranslations('Auth');

  return (
    <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
      <LoginForm />

      <div className='mt-6'>
        <div className='text-center'>
          <span className='text-sm text-gray-600'>
            {t('noAccount')}{' '}
            <Link
              href='/register'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              {t('createAccount')}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
