'use client';

import { locales } from '@/i18n/routing';
import { Locale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  className = '',
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // Remove the current locale from pathname and add the new one
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
  };

  const getLocaleName = (locale: Locale) => {
    const names = {
      en: 'English',
      uz: "O'zbekcha",
      ru: 'Русский',
    };
    return names[locale];
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === currentLocale
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {getLocaleName(locale)}
        </button>
      ))}
    </div>
  );
}
