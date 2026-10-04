import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/sections/ContactForm';
import { PageHero } from '@/components/sections/PageHero';
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

  return (
    <div className="pt-28 pb-24 md:pt-36">
      <Container className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <PageHero namespace="Contact" />
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-8 inline-block text-gold underline-offset-4 hover:underline"
          >
            {siteConfig.email}
          </a>
        </div>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </Container>
    </div>
  );
}
