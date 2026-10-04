'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export function PageHero({
  namespace,
  wide,
}: {
  namespace: 'MembersPage' | 'ProductsPage' | 'Contact';
  wide?: boolean;
}) {
  const t = useTranslations(namespace);

  return (
    <Reveal>
      <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
      <h1 className="font-display mt-4 whitespace-pre-line text-5xl leading-[0.95] md:text-7xl">
        {t('title')}
      </h1>
      <p
        className={`mt-6 text-lg text-fg-muted ${wide ? 'max-w-3xl whitespace-pre-line leading-relaxed' : 'max-w-2xl'}`}
      >
        {t(namespace === 'Contact' ? 'body' : 'subtitle')}
      </p>
    </Reveal>
  );
}
