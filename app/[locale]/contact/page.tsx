import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/sections/ContactForm';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import { toLocale } from '@/lib/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'MetaContact' });
  return buildMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    path: '/contact',
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Contact');

  return (
    <div className="pt-28 pb-24 md:pt-36">
      <Container className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
          <h1 className="font-display mt-4 whitespace-pre-line text-5xl leading-[0.95] md:text-7xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-fg-muted">{t('body')}</p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-8 inline-block text-gold underline-offset-4 hover:underline"
          >
            {siteConfig.email}
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </Container>
    </div>
  );
}
