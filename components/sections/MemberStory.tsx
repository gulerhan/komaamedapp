import { SharpImage } from '@/components/ui/SharpImage';
import { getTranslations } from 'next-intl/server';
import type { Member, TimelineItem } from '@/data/types';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export async function MemberStory({
  member,
  prev,
  next,
}: {
  member: Member;
  prev: Member;
  next: Member;
}) {
  const t = await getTranslations(`MembersContent.${member.slug}`);
  const ui = await getTranslations('Member');
  const prevT = await getTranslations(`MembersContent.${prev.slug}`);
  const nextT = await getTranslations(`MembersContent.${next.slug}`);
  const quote = t('quote').trim();
  const story = t('story').trim();
  const birthPlace = t('birthPlace').trim();
  const timeline = (t.raw('timeline') as TimelineItem[]) ?? [];

  return (
    <article>
      <section className="relative isolate min-h-[88svh] overflow-hidden bg-bg">
        <SharpImage
          src={member.image}
          alt={t('name')}
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-bg/20" />
        <Container className="relative z-10 flex min-h-[88svh] flex-col justify-end pb-16 pt-32">
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{t('role')}</p>
          <h1 className="font-display mt-3 text-6xl md:text-8xl">{t('name')}</h1>
        </Container>
      </section>

      <Container className="py-20 md:py-28">
        {quote ? (
          <Reveal>
            <blockquote className="font-display max-w-4xl text-3xl leading-tight text-fg md:text-5xl">
              “{quote}”
            </blockquote>
            <p className="mt-6 text-xs tracking-[0.22em] text-gold uppercase">{ui('quoteLabel')}</p>
          </Reveal>
        ) : null}

        <div className="mt-16 grid gap-10 border-y border-border py-10 md:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-fg-muted uppercase">{ui('role')}</p>
            <p className="mt-2 text-xl">{t('role')}</p>
          </div>
          {birthPlace ? (
            <div>
              <p className="text-[11px] tracking-[0.22em] text-fg-muted uppercase">{ui('born')}</p>
              <p className="mt-2 text-xl">{birthPlace}</p>
            </div>
          ) : null}
        </div>

        {story ? (
          <Reveal>
            <p className="mt-16 max-w-3xl text-lg leading-relaxed text-fg-muted">{story}</p>
          </Reveal>
        ) : null}

        {timeline.length > 0 ? (
          <div className="mt-20">
            <h2 className="text-xs tracking-[0.28em] text-gold uppercase">{ui('story')}</h2>
            <ol className="relative mt-10 border-l border-gold/30 pl-8">
              {timeline.map((item, index) => (
                <Reveal key={`${item.year}-${index}`} delay={index * 0.08}>
                  <li className="relative mb-12 last:mb-0">
                    <span className="absolute top-1.5 -left-[39px] size-3 rounded-full bg-gold" />
                    <p className="text-sm tracking-[0.2em] text-gold">{item.year}</p>
                    <h3 className="font-display mt-2 text-3xl">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-fg-muted">{item.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="mt-24">
          <h2 className="text-xs tracking-[0.28em] text-gold uppercase">{ui('gallery')}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {member.gallery.map((src, index) => (
              <Reveal key={src} delay={index * 0.08}>
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-bg-surface">
                  <SharpImage
                    src={src}
                    alt={`${t('name')} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-6 border-t border-border pt-10 md:grid-cols-3">
          <Link href={`/members/${prev.slug}`} className="group">
            <p className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">{ui('prev')}</p>
            <p className="font-display mt-2 text-3xl group-hover:text-gold">{prevT('name')}</p>
          </Link>
          <Link
            href="/members"
            className="self-center text-center text-xs tracking-[0.22em] text-gold uppercase"
          >
            {ui('back')}
          </Link>
          <Link href={`/members/${next.slug}`} className="group md:text-right">
            <p className="text-[11px] tracking-[0.2em] text-fg-muted uppercase">{ui('next')}</p>
            <p className="font-display mt-2 text-3xl group-hover:text-gold">{nextT('name')}</p>
          </Link>
        </div>
      </Container>
    </article>
  );
}
