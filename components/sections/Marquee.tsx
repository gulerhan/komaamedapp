import { getTranslations } from 'next-intl/server';

export async function Marquee() {
  const t = await getTranslations('Marquee');
  const text = `${t('text')} ${t('text')}`;

  return (
    <div className="overflow-hidden border-y border-border py-5" aria-hidden="true">
      <div className="marquee-track flex w-max gap-8">
        <p className="font-accent text-2xl tracking-[0.22em] text-gold/70 uppercase md:text-4xl">
          {text}
        </p>
        <p className="font-accent text-2xl tracking-[0.22em] text-gold/70 uppercase md:text-4xl">
          {text}
        </p>
      </div>
    </div>
  );
}
