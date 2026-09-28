import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  let resolved = locale;

  if (!resolved) {
    try {
      const { locale: getRootLocale } = await import('next/root-params');
      const paramValue = await getRootLocale();
      if (hasLocale(routing.locales, paramValue)) {
        resolved = paramValue;
      }
    } catch {
      resolved = undefined;
    }
  }

  if (!resolved) {
    const requested = await requestLocale;
    resolved = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale;
  }

  if (!hasLocale(routing.locales, resolved)) {
    resolved = routing.defaultLocale;
  }

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
