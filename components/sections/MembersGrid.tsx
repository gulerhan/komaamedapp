'use client';

import { useTranslations } from 'next-intl';
import { members } from '@/data/members';
import { Link } from '@/i18n/navigation';
import { SharpImage } from '@/components/ui/SharpImage';

export function MembersGrid() {
  const t = useTranslations('MembersContent');
  const memberUi = useTranslations('Member');

  return (
    <div className="flex flex-col gap-8">
      {members.map((member) => (
        <Link
          key={member.slug}
          href={`/members/${member.slug}`}
          className="group grid overflow-hidden rounded-[2rem] border border-border bg-bg-surface transition-colors hover:border-gold/40 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]"
        >
          <div className="relative aspect-3/4 bg-bg md:aspect-auto md:min-h-[340px]">
            <SharpImage
              src={member.image}
              alt={t(`${member.slug}.name`)}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
              {t(`${member.slug}.role`)}
            </p>
            <h2 className="font-display mt-2 text-4xl md:text-5xl lg:text-6xl">
              {t(`${member.slug}.name`)}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
              {t(`${member.slug}.shortBio`)}
            </p>
            <span className="mt-8 text-xs tracking-[0.2em] text-gold uppercase">
              {memberUi('story')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
