'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import ku from '@/messages/ku.json';
import tr from '@/messages/tr.json';

const catalogs = { ku, tr, en, de } as const;
const STORAGE_KEY = 'koma-locale';
const COOKIE_KEY = 'NEXT_LOCALE';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useAppLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useAppLocale must be used within LocaleProvider');
  }
  return context;
}

function isLocale(value: string | null): value is Locale {
  return !!value && routing.locales.includes(value as Locale);
}

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // private mode
  }
  document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = isLocale(saved) ? saved : locale;
    if (next !== locale) {
      setLocaleState(next);
    }
    persistLocale(next);
    // First paint must match the server locale; restore after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={catalogs[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
