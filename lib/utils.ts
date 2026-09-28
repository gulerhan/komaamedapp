import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: string) {
  return new Intl.NumberFormat(
    locale === 'tr' || locale === 'ku' ? 'tr-TR' : locale === 'de' ? 'de-DE' : 'en-US',
    {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    },
  ).format(amount);
}
