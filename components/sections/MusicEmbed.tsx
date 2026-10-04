'use client';

import { useTranslations } from 'next-intl';
import { musicEmbeds } from '@/lib/site';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export function MusicEmbed() {
  const t = useTranslations('Music');

  return (
    <section id="music" className="py-24 md:py-32">
      <Container>
        <Reveal>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
          <h2 className="font-display mt-3 max-w-2xl text-4xl md:text-6xl">{t('title')}</h2>
          <p className="mt-4 max-w-xl text-fg-muted">{t('body')}</p>
        </Reveal>
        <div className={`mt-12 grid gap-6 ${musicEmbeds.youtube ? 'lg:grid-cols-2' : ''}`}>
          <Reveal>
            <div className="overflow-hidden rounded-[1.75rem] border border-border bg-bg-surface">
              <p className="px-5 pt-4 text-[11px] tracking-[0.22em] text-gold uppercase">
                {t('spotify')}
              </p>
              <iframe
                title={t('spotify')}
                src={musicEmbeds.spotify}
                className="mt-3 h-40 w-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </Reveal>
          {musicEmbeds.youtube ? (
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-bg-surface">
                <p className="px-5 pt-4 text-[11px] tracking-[0.22em] text-gold uppercase">
                  {t('youtube')}
                </p>
                <div className="relative mt-3 aspect-video w-full bg-bg">
                  <iframe
                    title={t('youtube')}
                    src={musicEmbeds.youtube}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
