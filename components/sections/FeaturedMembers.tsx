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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {featured.map((member, index) => (
            <Reveal key={member.slug} delay={index * 0.06}>
              <TiltCard className="group relative overflow-hidden rounded-[1.75rem] bg-bg-surface">
                <Link href={`/members/${member.slug}`} className="block">
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <SharpImage
                      src={member.image}
                      alt={content(`${member.slug}.name`)}
                      fill
                      className="object-cover object-[center_18%]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/25 to-transparent" />
                  <div className="absolute right-5 bottom-5 left-5">
                    <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
                      {content(`${member.slug}.role`)}
                    </p>
                    <h3 className="font-display mt-1 text-2xl sm:text-3xl">
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
