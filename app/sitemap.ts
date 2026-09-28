import type { MetadataRoute } from 'next';
import { members } from '@/data/members';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site';

const paths = ['', '/members', '/products', '/about', '/contact', ...members.map((m) => `/members/${m.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${siteConfig.url}/${locale}${path}`]),
    );
    return {
      url: `${siteConfig.url}/${routing.defaultLocale}${path}`,
      lastModified: new Date(),
      alternates: { languages },
    };
  });
}
