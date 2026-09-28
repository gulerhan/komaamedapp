import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MembersGrid } from '@/components/sections/MembersGrid';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { buildMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'MetaMembers' });
  return buildMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    path: '/members',
  });
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('MembersPage');

  return (
    <div className="pt-28 pb-24 md:pt-36">
      <Container>
        <Reveal>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
          <h1 className="font-display mt-4 whitespace-pre-line text-5xl leading-[0.95] md:text-7xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-fg-muted">
            {t('subtitle')}
          </p>
        </Reveal>
        <div className="mt-16">
          <MembersGrid />
        </div>
      </Container>
    </div>
  );
}
