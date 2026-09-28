'use client';

import { MotionConfig } from 'motion/react';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { Preloader } from '@/components/layout/Preloader';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { VinylPlayer } from '@/components/layout/VinylPlayer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <CustomCursor />
        <Preloader />
        <VinylPlayer />
        {children}
      </SmoothScroll>
    </MotionConfig>
  );
}
