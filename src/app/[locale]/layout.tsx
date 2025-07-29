import { NextIntlClientProvider } from 'next-intl';
import { metadata } from '@/shared/config';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { getServerAuth } from '@/shared/lib/auth-server';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { ToastProvider } from '@/shared/providers/ToastProvider';
import { AsyncErrorBoundary } from '@/shared/components';

export { metadata };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Load messages for the current locale
  let messages;
  try {
    messages = (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    // Fallback to English if locale not found
    messages = (await import(`@/locales/en.json`)).default;
  }

  // Get server-side auth state
  const { user, isAuthenticated } = await getServerAuth();

  return (
    <NextIntlClientProvider messages={messages}>
      <AsyncErrorBoundary>
        <QueryProvider>
          <AuthProvider
            initialUser={user}
            initialIsAuthenticated={isAuthenticated}
          >
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </AsyncErrorBoundary>
    </NextIntlClientProvider>
  );
}
