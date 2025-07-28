import { NextIntlClientProvider } from 'next-intl';
import { metadata } from '@/shared/config';

export { metadata };

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
