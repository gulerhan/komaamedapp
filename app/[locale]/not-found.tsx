import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-5xl md:text-7xl">{t('title')}</h1>
      <p className="mt-4 max-w-md text-fg-muted">{t('body')}</p>
      <Link href="/" className={`${buttonStyles({ variant: 'gold' })} mt-8`}>
        {t('cta')}
      </Link>
    </div>
  );
}
