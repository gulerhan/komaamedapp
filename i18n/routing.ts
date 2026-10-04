import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ku', 'tr', 'en', 'de'],
  defaultLocale: 'ku',
  localePrefix: 'never',
  localeDetection: false,
  localeCookie: true,
});

export type Locale = (typeof routing.locales)[number];
