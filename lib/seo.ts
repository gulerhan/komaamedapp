import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site';

function ogLocale(locale: string) {
  if (locale === 'tr') return 'tr_TR';
  if (locale === 'de') return 'de_DE';
  if (locale === 'ku') return 'ku_TR';
  return 'en_US';
}

export function buildMetadata({
  locale,
  title,
  description,
  path = '',
}: {
  locale: string;
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const normalized = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const url = `${siteConfig.url}/${locale}${normalized}`;
  const languages: Record<string, string> = {
    'x-default': `${siteConfig.url}/${routing.defaultLocale}${normalized}`,
  };

  for (const item of routing.locales) {
    languages[item] = `${siteConfig.url}/${item}${normalized}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: ogLocale(locale),
      alternateLocale: routing.locales
        .filter((item) => item !== locale)
        .map(ogLocale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
