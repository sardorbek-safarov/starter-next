'use client';

import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

export const useToast = () => {
  const t = useTranslations();

  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showWarning = (message: string) => {
    toast.warning(message);
  };

  const showInfo = (message: string) => {
    toast.info(message);
  };

  // Helper functions with translations
  const showAuthError = (error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    toast.error(message);
  };

  const showAuthSuccess = (type: 'login' | 'register' | 'logout') => {
    const messages = {
      login: t('Auth.login.success'),
      register: t('Auth.register.success'),
      logout: t('Auth.logout.success'),
    };
    toast.success(messages[type]);
  };

  const showGenericError = () => {
    toast.error(t('common.error.generic'));
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAuthError,
    showAuthSuccess,
    showGenericError,
  };
};
