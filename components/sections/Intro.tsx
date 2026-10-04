'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export function Intro() {
  const t = useTranslations('Intro');

  return (
    <section id="intro" className="relative py-24 md:py-36">
      <Container>
        <Reveal>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
        </Reveal>
        <div className="mt-6 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <Reveal>
            <h2 className="font-display whitespace-pre-line text-4xl leading-[0.95] text-fg md:text-6xl lg:text-7xl">
              {t('title')}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="max-w-md text-lg leading-relaxed text-fg-muted">{t('body')}</p>
          </Reveal>
        </div>
        <Reveal delay={0.18}>
          <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-border pt-10">
            {[
              { label: t('stat1Label'), value: t('stat1Value') },
              { label: t('stat2Label'), value: t('stat2Value') },
              { label: t('stat3Label'), value: t('stat3Value') },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] tracking-[0.22em] text-fg-muted uppercase">
                  {item.label}
                </dt>
                <dd className="font-display mt-2 text-4xl text-gold md:text-6xl">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
