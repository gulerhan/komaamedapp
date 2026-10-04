'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, usePathname } from '@/i18n/navigation';
import { SharpImage } from '@/components/ui/SharpImage';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

const links = [
  { href: '/', key: 'home' as const },
  { href: '/members', key: 'members' as const },
  { href: '/products', key: 'products' as const },
  { href: '/about', key: 'about' as const },
  { href: '/contact', key: 'contact' as const },
];

export function SiteHeader() {
  const t = useTranslations('Nav');
  const common = useTranslations('Common');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 border-b transition-colors duration-500',
        scrolled || open
          ? 'border-border/50 bg-bg/40 backdrop-blur-2xl backdrop-saturate-150'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between px-5 md:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-3 text-fg"
        >
          <SharpImage
            src="/koma/mark.jpg"
            alt="Koma Amed"
            width={500}
            height={500}
            className="size-11"
            priority
          />
          <span className="font-accent text-sm tracking-[0.28em] uppercase">
            {common('brand')}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label="Main">
          {links.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-[11px] tracking-[0.16em] uppercase transition-colors',
                  active ? 'text-gold' : 'text-fg-muted hover:text-fg',
                )}
              >
                {t(link.key)}
                {active ? (
                  <span className="absolute -bottom-2 left-0 h-px w-full bg-gold" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-fg lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? common('closeMenu') : common('openMenu')}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-t border-white/10 bg-transparent px-5 py-8 lg:hidden"
          >
            <nav className="flex flex-col gap-3" aria-label="Mobile">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-[1.65rem] leading-snug tracking-tight text-fg"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-7 w-fit">
              <LanguageSwitcher />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
