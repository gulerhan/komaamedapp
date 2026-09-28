import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AboutStory } from '@/components/sections/AboutStory';
import { buildMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'MetaAbout' });
  return buildMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    path: '/about',
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  return <AboutStory />;
}
