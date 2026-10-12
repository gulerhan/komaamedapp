'use client';

import { useTranslations } from 'next-intl';
import { members } from '@/data/members';
import { Link } from '@/i18n/navigation';
import { SharpImage } from '@/components/ui/SharpImage';

export function MembersGrid() {
  const t = useTranslations('MembersContent');
  const memberUi = useTranslations('Member');

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {members.map((member) => (
        <Link
          key={member.slug}
          href={`/members/${member.slug}`}
          className="group grid overflow-hidden rounded-[1.75rem] border border-border bg-bg-surface transition-colors hover:border-gold/40 md:grid-cols-[10.5rem_1fr] lg:grid-cols-[13rem_1fr]"
        >
          <div className="relative aspect-[5/4] overflow-hidden bg-bg md:aspect-auto md:min-h-40">
            <SharpImage
              src={member.image}
              alt={t(`${member.slug}.name`)}
              fill
              className={
                member.slug === 'evdilmelik-sexbekir'
                  ? 'object-cover object-center'
                  : 'object-cover object-[center_18%]'
              }
              sizes="(max-width: 768px) 100vw, 208px"
            />
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-6 lg:px-10 lg:py-7">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
              {t(`${member.slug}.role`)}
            </p>
            <h2 className="font-display mt-1.5 text-3xl md:text-4xl">
              {t(`${member.slug}.name`)}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
              {t(`${member.slug}.shortBio`)}
            </p>
            <span className="mt-5 text-xs tracking-[0.2em] text-gold uppercase">
              {memberUi('story')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
