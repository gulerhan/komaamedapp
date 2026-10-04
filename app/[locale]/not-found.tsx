'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('NotFound');

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
