'use client';

import { useTranslations } from 'next-intl';

export function SkipToContent() {
  const t = useTranslations('Common');

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-bg"
    >
      {t('skipToContent')}
    </a>
  );
}
