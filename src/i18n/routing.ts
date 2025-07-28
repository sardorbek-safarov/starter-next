import { defineRouting } from 'next-intl/routing';
export const locales = ['en', 'uz', 'ru'] as const;
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'uz',
});
