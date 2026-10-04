import type { MetadataRoute } from 'next';
import { members } from '@/data/members';
import { siteConfig } from '@/lib/site';

const paths = ['', '/members', '/products', '/about', '/contact', ...members.map((m) => `/members/${m.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${siteConfig.url}${path || '/'}`,
    lastModified: new Date(),
  }));
}
