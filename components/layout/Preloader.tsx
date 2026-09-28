'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';

export function Preloader() {
  const t = useTranslations('Preloader');
  const [visible, setVisible] = useState(false);
  const letters = 'KOMA AMED'.split('');

  useEffect(() => {
    if (sessionStorage.getItem('koma-preloader') === '1') return;

    const show = window.setTimeout(() => setVisible(true), 0);
    const hide = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('koma-preloader', '1');
    }, 2400);

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-bg motion-reduce:hidden"
          exit={{ y: '-100%', transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
          role="status"
          aria-label={t('label')}
        >
          <div className="overflow-hidden">
            <p className="font-display flex gap-[0.08em] text-5xl tracking-[0.18em] text-gold md:text-7xl">
              {letters.map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{
                    delay: 0.12 + index * 0.06,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {letter === ' ' ? '\u00a0' : letter}
                </motion.span>
              ))}
            </p>
          </div>
          <motion.span
            className="absolute bottom-16 left-1/2 h-px w-24 -translate-x-1/2 origin-left bg-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
