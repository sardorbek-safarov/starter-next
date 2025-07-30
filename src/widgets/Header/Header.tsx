'use client';

import { useAuth } from '@/features/auth';
import { LanguageSwitcher } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

type Locale = 'en' | 'uz' | 'ru';

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const t = useTranslations('Header');
  const router = useRouter();
  console.log(
    'Header rendered with user:',
    user,
    'isAuthenticated:',
    isAuthenticated
  );

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('logoutSuccess') || 'Logged out successfully');
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      toast.error(t('logoutError') || 'Failed to logout');
      console.error('Logout error:', error);
    }
  };

  return (
    <header className='w-full flex justify-between items-center py-4 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
      <div className='flex items-center gap-4'>
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Starter Next
        </h1>
      </div>

      <div className='flex items-center gap-4'>
        {isAuthenticated && user && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600 dark:text-gray-300'>
              {t('welcome')} {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className='px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md transition-colors disabled:opacity-50'
            >
              {isLoading
                ? t('loggingOut') || 'Logging out...'
                : t('logout') || 'Logout'}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className='flex items-center gap-2'>
            <Button href='/login' variant='secondary'>
              {t('login') || 'Login'}
            </Button>
            <Button href='/register' variant='primary'>
              {t('register') || 'Register'}
            </Button>
          </div>
        )}

        <LanguageSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
