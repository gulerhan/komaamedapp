'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (event: MouseEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
      const target = event.target as HTMLElement | null;
      const hoverable = Boolean(
        target?.closest('a, button, [role="button"], input, textarea, select'),
      );
      setHover(hoverable);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[90] mix-blend-difference"
        animate={{
          x: pos.x - 4,
          y: pos.y - 4,
          scale: hover ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.4 }}
      >
        <span className="block size-2 rounded-full bg-gold-bright" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[90] mix-blend-difference"
        animate={{
          x: pos.x - 18,
          y: pos.y - 18,
          scale: hover ? 1.55 : 1,
        }}
        transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.6 }}
      >
        <span className="block size-9 rounded-full border border-gold-bright/80" />
      </motion.div>
    </>
  );
}
