'use client';

import { SharpImage } from '@/components/ui/SharpImage';
import { useTranslations } from 'next-intl';
import { members } from '@/data/members';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { TiltCard } from '@/components/ui/TiltCard';
import { buttonStyles } from '@/components/ui/Button';

export function FeaturedMembers() {
  const t = useTranslations('FeaturedMembers');
  const content = useTranslations('MembersContent');
  const featured = members.filter((member) => member.featured);

  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('eyebrow')}</p>
              <h2 className="font-display mt-3 text-4xl md:text-6xl">{t('title')}</h2>
            </div>
            <Link href="/members" className={buttonStyles({ variant: 'outline' })}>
              {t('cta')}
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((member, index) => (
            <Reveal key={member.slug} delay={index * 0.06}>
              <TiltCard className="group relative overflow-hidden rounded-[2rem] bg-bg-surface">
                <Link href={`/members/${member.slug}`} className="block">
                  <div className="relative aspect-3/4">
                    <SharpImage
                      src={member.image}
                      alt={content(`${member.slug}.name`)}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent" />
                  <div className="absolute right-6 bottom-6 left-6">
                    <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
                      {content(`${member.slug}.role`)}
                    </p>
                    <h3 className="font-display mt-1 text-3xl md:text-4xl">
                      {content(`${member.slug}.name`)}
                    </h3>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
