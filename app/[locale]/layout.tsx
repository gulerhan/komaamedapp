import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';
import { fontAccent, fontDisplay, fontSans } from '@/lib/fonts';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import { musicGroupJsonLd } from '@/lib/schema';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Providers } from '@/components/layout/Providers';
import { SkipToContent } from '@/components/layout/SkipToContent';
import { JsonLd } from '@/components/layout/JsonLd';
import { toLocale } from '@/lib/locale';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    metadataBase: new URL(siteConfig.url),
    ...buildMetadata({
      locale,
      title: t('title'),
      description: t('description'),
    }),
    title: {
      default: t('title'),
      template: t('template'),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontAccent.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-fg">
        <JsonLd data={musicGroupJsonLd()} />
        <LocaleProvider initialLocale={locale}>
          <Providers>
            <SkipToContent />
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
