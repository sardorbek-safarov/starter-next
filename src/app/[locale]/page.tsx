import { locales } from '@/i18n/routing';
import { HomePage } from '@/page-layouts';
import { Locale } from 'next-intl';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <HomePage locale={locale} />;
}
