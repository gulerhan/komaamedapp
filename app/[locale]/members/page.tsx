import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MembersGrid } from '@/components/sections/MembersGrid';
import { PageHero } from '@/components/sections/PageHero';
import { Container } from '@/components/ui/Container';
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

  return (
    <div className="pt-28 pb-24 md:pt-36">
      <Container>
        <PageHero namespace="MembersPage" wide />
        <div className="mt-16">
          <MembersGrid />
        </div>
      </Container>
    </div>
  );
}
