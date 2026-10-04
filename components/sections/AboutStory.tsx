'use client';

import { SharpImage } from '@/components/ui/SharpImage';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

const ABOUT_IMAGE = '/koma/band.jpg';

export function AboutStory() {
  const t = useTranslations('About');

  return (
    <>
      <section className="relative isolate min-h-[70svh] overflow-hidden bg-bg">
        <SharpImage src={ABOUT_IMAGE} alt="" fill priority sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/55 to-bg/30" />
        <Container className="relative z-10 flex min-h-[70svh] items-end pb-16 pt-32">
          <div>
            <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
            <h1 className="font-display mt-4 whitespace-pre-line text-5xl leading-[0.95] md:text-7xl">
              {t('title')}
            </h1>
          </div>
        </Container>
      </section>
      <Container className="py-20 md:py-28">
        <Reveal>
          <p className="font-display max-w-3xl text-3xl leading-tight md:text-4xl">{t('lead')}</p>
        </Reveal>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Reveal>
            <p className="text-lg leading-relaxed text-fg-muted">{t('p1')}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-fg-muted">{t('p2')}</p>
            <p className="mt-6 text-lg leading-relaxed text-fg-muted">{t('p3')}</p>
          </Reveal>
        </div>
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {[
            { n: '01', title: t('chapter1'), body: t('chapter1Body') },
            { n: '02', title: t('chapter2'), body: t('chapter2Body') },
            { n: '03', title: t('chapter3'), body: t('chapter3Body') },
          ].map((item, index) => (
            <Reveal key={item.n} delay={index * 0.08}>
              <article className="rounded-[1.6rem] border border-border bg-bg-surface p-8">
                <p className="text-xs tracking-[0.22em] text-gold uppercase">{item.n}</p>
                <h2 className="font-display mt-4 text-3xl">{item.title}</h2>
                <p className="mt-4 text-fg-muted">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
