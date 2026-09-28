import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Intro } from '@/components/sections/Intro';
import { Marquee } from '@/components/sections/Marquee';
import { FeaturedMembers } from '@/components/sections/FeaturedMembers';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { MusicEmbed } from '@/components/sections/MusicEmbed';
import { buildMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'MetaHome' });
  return buildMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Intro />
      <Marquee />
      <FeaturedMembers />
      <FeaturedProducts />
      <MusicEmbed />
    </>
  );
}
