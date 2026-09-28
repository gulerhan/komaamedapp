import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ku', 'tr', 'en', 'de'],
  defaultLocale: 'ku',
  localePrefix: 'always',
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
