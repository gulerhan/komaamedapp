'use client';

import { SharpImage } from '@/components/ui/SharpImage';
import { useTranslations } from 'next-intl';
import { ArrowDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';

const HERO_IMAGE = '/koma/band.jpg';

function AnimatedWord({ word, delay }: { word: string; delay: number }) {
  return (
    <span className="inline-flex overflow-hidden [perspective:480px]">
      {word.split('').map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="hero-letter"
          style={{ animationDelay: `${delay + index * 0.055}s` }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-bg">
      <div className="absolute inset-0">
        <SharpImage
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-bg/30 via-bg/55 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(196,92,58,0.22),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(201,164,92,0.16),transparent_46%)]" />

      <div className="orb absolute top-[12%] left-[8%] size-[42vw] max-w-xl rounded-full bg-terracotta/20 blur-3xl" />
      <div
        className="orb absolute right-[6%] bottom-[18%] size-[36vw] max-w-lg rounded-full bg-gold/15 blur-3xl"
        style={{ animationDelay: '-7s' }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="particle absolute bottom-[-10%] h-1 w-px bg-gold/50"
            style={{
              left: `${6 + index * 5.2}%`,
              animationDuration: `${10 + (index % 6) * 2.4}s`,
              animationDelay: `${index * 0.45}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-20 md:px-8 md:pb-24 lg:px-12">
        <p className="hero-kicker mb-6 text-xs tracking-[0.32em] text-gold uppercase">
          {t('kicker')}
        </p>
        <h1 className="font-display text-[22vw] leading-[0.78] tracking-[-0.04em] text-fg sm:text-[16vw] lg:text-[11.5vw]">
          <AnimatedWord word="KOMA" delay={0.55} />
          <br />
          <AnimatedWord word="AMED" delay={0.78} />
        </h1>
        <p className="hero-subtitle mt-8 max-w-xl text-base text-fg-muted md:text-lg">
          {t('subtitle')}
        </p>
        <div className="hero-cta mt-10 flex flex-wrap items-center gap-4">
          <Magnetic>
            <Link href="/members" className={buttonStyles({ variant: 'gold' })}>
              {t('ctaPrimary')}
            </Link>
          </Magnetic>
        </div>
      </div>

      <a
        href="#intro"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.28em] text-fg-muted uppercase"
      >
        {t('scroll')}
        <ArrowDown className="size-4 animate-bounce text-gold" />
      </a>
    </section>
  );
}
