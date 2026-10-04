'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { socialLinks } from '@/lib/site';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2ZM17.2 6.6a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M23 12.2s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C18.9 5 12 5 12 5s-6.9 0-8.5.5A3 3 0 0 0 1.4 7.6C1 9 1 12.2 1 12.2s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C5.1 19.4 12 19.4 12 19.4s6.9 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6ZM9.8 15.5v-6.6l6.2 3.3Z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z"
      />
    </svg>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5Zm4.6 15.1c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-1-.3.1-.7-.1-.8-.5-.1-.3.1-.7.5-.8 4-.9 7.4-.5 10.1 1.1.3.2.4.6.2.9Zm1.2-2.7c-.2.4-.7.5-1.1.3-2.8-1.7-7-2.2-10.3-1.2-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.7-1.1 8.3-.6 11.5 1.4.3.2.5.7.3 1Zm.1-2.8C14.6 9.3 9.3 9.1 6.4 10c-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.4-1 9.2-.8 12.8 1.3.4.3.6.9.3 1.3-.2.4-.8.6-1.2.3Z"
      />
    </svg>
  );
}

const icons = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  spotify: SpotifyIcon,
};

export function SiteFooter() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Nav');
  const common = useTranslations('Common');
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-elevated">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-16 md:grid-cols-3 md:px-8 lg:px-12">
        <div>
          <p className="font-accent text-sm tracking-[0.28em] text-gold uppercase">
            {common('brand')}
          </p>
          <p className="font-display mt-4 max-w-sm text-2xl text-fg/90">
            {t('tagline')}
          </p>
        </div>
        <nav className="flex flex-col gap-3 text-sm tracking-[0.16em] text-fg-muted uppercase">
          <Link href="/" className="hover:text-gold">
            {nav('home')}
          </Link>
          <Link href="/members" className="hover:text-gold">
            {nav('members')}
          </Link>
          <Link href="/products" className="hover:text-gold">
            {nav('products')}
          </Link>
          <Link href="/about" className="hover:text-gold">
            {nav('about')}
          </Link>
          <Link href="/contact" className="hover:text-gold">
            {nav('contact')}
          </Link>
        </nav>
        <div className="flex flex-col justify-between">
          <ul className="flex gap-4">
            {socialLinks.map((link) => {
              const Icon = icons[link.id];
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-gold hover:text-gold"
                    aria-label={link.id}
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-xs tracking-[0.14em] text-fg-muted uppercase">
            © {year} {common('brand')}. {t('rights')} · {t('note')}
          </p>
        </div>
      </div>
    </footer>
  );
}
