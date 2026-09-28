import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { members, getAdjacentMembers, getMember } from '@/data/members';
import { routing } from '@/i18n/routing';
import { MemberStory } from '@/components/sections/MemberStory';
import { buildMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/locale';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    members.map((member) => ({ locale, slug: member.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = toLocale(localeParam);
  const member = getMember(slug);
  if (!member) return {};
  const t = await getTranslations({ locale, namespace: 'MetaMember' });
  const content = await getTranslations({
    locale,
    namespace: `MembersContent.${member.slug}`,
  });
  return buildMetadata({
    locale,
    title: t('title', { name: content('name') }),
    description: t('description', { name: content('name'), role: content('role') }),
    path: `/members/${member.slug}`,
  });
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = toLocale(localeParam);
  setRequestLocale(locale);
  const member = getMember(slug);
  if (!member) notFound();
  const { prev, next } = getAdjacentMembers(member.slug);

  return <MemberStory member={member} prev={prev} next={next} />;
}
