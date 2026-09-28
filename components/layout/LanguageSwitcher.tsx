'use client';

import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="relative inline-flex w-fit items-center rounded-full border border-border bg-bg-elevated/60 p-1"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((item) => {
        const active = item === locale;
        return (
          <button
            key={item}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                router.replace(pathname, { locale: item });
              })
            }
            className={cn(
              'relative z-10 min-w-8 rounded-full px-2.5 py-1.5 text-[11px] tracking-[0.18em] uppercase transition-colors',
              active ? 'text-bg' : 'text-fg-muted hover:text-fg',
            )}
            aria-current={active ? 'true' : undefined}
          >
            {active ? (
              <span className="absolute inset-0 -z-10 rounded-full bg-gold" />
            ) : null}
            {item}
          </button>
        );
      })}
    </div>
  );
}
