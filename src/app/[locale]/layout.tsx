import { AsyncErrorBoundary } from '@/shared/components';
import { metadata } from '@/shared/config';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { ToastProvider } from '@/shared/providers/ToastProvider';
import { NextIntlClientProvider } from 'next-intl';

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

  return (
    <NextIntlClientProvider messages={messages}>
      <AsyncErrorBoundary>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </AsyncErrorBoundary>
    </NextIntlClientProvider>
  );
}
