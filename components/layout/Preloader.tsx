'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  isGestureLockedBrowser,
  readSessionFlag,
  writeSessionFlag,
} from '@/lib/spotify-embed';
import {
  isVinylReady,
  playVinylFromGesture,
  subscribeVinylReady,
} from '@/lib/vinyl-bridge';

export function Preloader() {
  const t = useTranslations('Preloader');
  const [visible, setVisible] = useState(false);
  const [requiresTap, setRequiresTap] = useState(false);
  const [hint, setHint] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const enteredRef = useRef(false);
  const letters = 'KOMA AMED'.split('');

  useEffect(() => {
    setPlayerReady(isVinylReady());
    return subscribeVinylReady(() => setPlayerReady(isVinylReady()));
  }, []);

  useEffect(() => {
    if (readSessionFlag('koma-preloader')) return;

    setVisible(true);
    const tap = isGestureLockedBrowser();
    setRequiresTap(tap);

    if (tap) {
      const showHint = window.setTimeout(() => setHint(true), 1100);
      return () => window.clearTimeout(showHint);
    }

    const hide = window.setTimeout(() => {
      setVisible(false);
      writeSessionFlag('koma-preloader', true);
      window.dispatchEvent(new Event('koma-preloader-done'));
    }, 2400);

    return () => window.clearTimeout(hide);
  }, []);

  const enter = () => {
    if (!visible || enteredRef.current) return;
    enteredRef.current = true;
    playVinylFromGesture();
    setVisible(false);
    writeSessionFlag('koma-preloader', true);
    window.dispatchEvent(new Event('koma-preloader-done'));
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          className="fixed inset-0 z-[95] flex cursor-pointer touch-manipulation items-center justify-center bg-bg"
          exit={{ y: '-100%', transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
          aria-label={requiresTap ? t('enter') : t('label')}
          onPointerUp={(event) => {
            if (event.pointerType === 'touch' || event.pointerType === 'pen') {
              enter();
            }
          }}
          onClick={enter}
        >
          <div className="flex flex-col items-center">
            <motion.p
              className="font-accent text-sm tracking-[0.32em] text-gold/80 uppercase md:text-base"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('welcome')}
            </motion.p>
            <div className="mt-4 overflow-hidden">
              <p className="font-display flex gap-[0.08em] text-5xl tracking-[0.18em] text-gold md:text-7xl">
                {letters.map((letter, index) => (
                  <motion.span
                    key={`${letter}-${index}`}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      delay: 0.18 + index * 0.06,
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
          </div>
          {requiresTap && hint ? (
            <motion.p
              className="font-accent absolute bottom-16 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.28em] text-gold/75 uppercase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {playerReady ? t('enter') : t('label')}
            </motion.p>
          ) : (
            <motion.span
              className="absolute bottom-16 left-1/2 h-px w-24 -translate-x-1/2 origin-left bg-gold"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
