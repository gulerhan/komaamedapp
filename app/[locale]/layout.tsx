import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';
import { fontAccent, fontDisplay, fontSans } from '@/lib/fonts';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import { musicGroupJsonLd } from '@/lib/schema';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Providers } from '@/components/layout/Providers';
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
  const messages = await getMessages();
  const t = await getTranslations('Common');

  return (
    <html
      lang={locale}
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontAccent.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-fg">
        <JsonLd data={musicGroupJsonLd()} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-bg"
            >
              {t('skipToContent')}
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
