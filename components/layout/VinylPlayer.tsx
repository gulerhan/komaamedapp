'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Disc3, LoaderCircle, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { SharpImage } from '@/components/ui/SharpImage';
import { cn } from '@/lib/utils';
import {
  EmbedController,
  IFrameAPI,
  ensureSpotifyIframeApi,
  isGestureLockedBrowser,
  loadTrack,
  pausePlayback,
  prepareSpotifyIframe,
  startPlayback,
} from '@/lib/spotify-embed';
import { spotifyTrackUri, spotifyTracks } from '@/lib/spotify';

const STORAGE_KEY = 'koma-vinyl-dismissed';
const OFFSET_KEY = 'koma-vinyl-offset';
const COMPACT_QUERY = '(max-width: 767px)';

type VinylOffset = { x: number; y: number };

function readVinylOffset(): VinylOffset {
  try {
    const raw = sessionStorage.getItem(OFFSET_KEY);
    if (!raw) return { x: 0, y: 0 };
    const parsed = JSON.parse(raw) as Partial<VinylOffset>;
    return {
      x: typeof parsed.x === 'number' && Number.isFinite(parsed.x) ? parsed.x : 0,
      y: typeof parsed.y === 'number' && Number.isFinite(parsed.y) ? parsed.y : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function writeVinylOffset(offset: VinylOffset) {
  try {
    sessionStorage.setItem(OFFSET_KEY, JSON.stringify(offset));
  } catch {
    /* Safari private mode can block storage */
  }
}

function headerBottom() {
  const header = document.querySelector('header');
  if (!header) return 8;
  return Math.ceil(header.getBoundingClientRect().bottom);
}

const vinylListeners = new Set<() => void>();

function subscribeVinyl(onStoreChange: () => void) {
  vinylListeners.add(onStoreChange);
  window.addEventListener('koma-vinyl', onStoreChange);
  return () => {
    vinylListeners.delete(onStoreChange);
    window.removeEventListener('koma-vinyl', onStoreChange);
  };
}

function vinylIsOpen() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === '1') return false;
    if (raw === '0') return true;
  } catch {
    /* Safari private mode can block storage */
  }
  return !window.matchMedia(COMPACT_QUERY).matches;
}

function setVinylOpen(open: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, open ? '0' : '1');
  } catch {
    /* Safari private mode can block storage */
  }
  vinylListeners.forEach((listener) => listener());
  window.dispatchEvent(new Event('koma-vinyl'));
}

function trackUriAt(index: number) {
  const next = (index + spotifyTracks.length) % spotifyTracks.length;
  return { index: next, uri: spotifyTrackUri(spotifyTracks[next].id) };
}

export function VinylPlayer() {
  const t = useTranslations('Player');
  const [fineHover, setFineHover] = useState(true);
  const visible = useSyncExternalStore<boolean | null>(
    subscribeVinyl,
    vinylIsOpen,
    () => null,
  );
  const controllersRef = useRef<[EmbedController | null, EmbedController | null]>([
    null,
    null,
  ]);
  const uriRef = useRef<[string, string]>(['', '']);
  const activeSlotRef = useRef(0);
  const indexRef = useRef(0);
  const unlockedRef = useRef(false);
  const endedRef = useRef(false);
  const dismissedRef = useRef(true);
  const loadedAtRef = useRef(0);
  const playArmedRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const gestureOnlyRef = useRef(false);
  const retryTimersRef = useRef<number[]>([]);
  const [hostEl, setHostEl] = useState<HTMLDivElement | null>(null);
  const [activated, setActivated] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [offset, setOffset] = useState<VinylOffset>(() =>
    typeof window === 'undefined' ? { x: 0, y: 0 } : readVinylOffset(),
  );
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef<VinylOffset>(offset);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    startLeft: number;
    startTop: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFineHover(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    gestureOnlyRef.current = isGestureLockedBrowser();
  }, []);

  const track = spotifyTracks[index];
  const loading = activated && !ready;
  const showDismiss = !fineHover || hovered || dragging;

  const applyOffset = useCallback((next: VinylOffset) => {
    offsetRef.current = next;
    setOffset(next);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const keepBelowHeader = () => {
      const dock = document.querySelector<HTMLElement>('.vinyl-dock');
      if (!dock || dragRef.current) return;
      const overflow = headerBottom() - dock.getBoundingClientRect().top;
      if (overflow <= 0) return;
      const next = { x: offsetRef.current.x, y: offsetRef.current.y + overflow };
      applyOffset(next);
      writeVinylOffset(next);
    };
    const frame = window.requestAnimationFrame(keepBelowHeader);
    window.addEventListener('resize', keepBelowHeader);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', keepBelowHeader);
    };
  }, [applyOffset, visible]);

  const onDockPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture needs a real user gesture. */
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
      startLeft: rect.left,
      startTop: rect.top,
      width: rect.width,
      height: rect.height,
    };
    setDragging(true);
  }, []);

  const onDockPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const minLeft = 8;
    const minTop = headerBottom();
    const maxLeft = Math.max(minLeft, window.innerWidth - drag.width - 8);
    const maxTop = Math.max(minTop, window.innerHeight - drag.height - 8);
    const left = Math.min(maxLeft, Math.max(minLeft, drag.startLeft + (event.clientX - drag.startX)));
    const top = Math.min(maxTop, Math.max(minTop, drag.startTop + (event.clientY - drag.startY)));
    applyOffset({
      x: drag.originX + (left - drag.startLeft),
      y: drag.originY + (top - drag.startTop),
    });
  }, [applyOffset]);

  const endDockDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    writeVinylOffset(offsetRef.current);
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* Pointer capture needs a real user gesture. */
    }
  }, []);

  const clearPlayRetries = useCallback(() => {
    retryTimersRef.current.forEach((id) => window.clearTimeout(id));
    retryTimersRef.current = [];
  }, []);

  const activeController = useCallback(() => {
    return controllersRef.current[activeSlotRef.current];
  }, []);

  const armPlay = useCallback(
    (controller: EmbedController) => {
      playArmedRef.current = true;
      startPlayback(controller);
      clearPlayRetries();

      const delays =
        unlockedRef.current || !gestureOnlyRef.current
          ? unlockedRef.current
            ? [160, 400, 900, 1600]
            : [80, 200, 400, 800, 1600, 2800, 4500]
          : [];

      delays.forEach((ms) => {
        retryTimersRef.current.push(
          window.setTimeout(() => {
            if (!playArmedRef.current || dismissedRef.current) return;
            startPlayback(controller);
          }, ms),
        );
      });
    },
    [clearPlayRetries],
  );

  const preloadStandby = useCallback(() => {
    const standby = 1 - activeSlotRef.current;
    const controller = controllersRef.current[standby];
    if (!controller) return;
    const { uri } = trackUriAt(indexRef.current + 1);
    if (uriRef.current[standby] === uri) return;
    loadTrack(controller, uri);
    uriRef.current[standby] = uri;
  }, []);

  const activateSlot = useCallback(
    (slot: number, nextIndex: number, autoplay: boolean) => {
      const other = 1 - slot;
      const standby = controllersRef.current[other];
      if (standby) pausePlayback(standby);
      activeSlotRef.current = slot;
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      endedRef.current = false;
      loadedAtRef.current = Date.now();
      const controller = controllersRef.current[slot];
      if (!controller) return;
      if (autoplay) armPlay(controller);
      else {
        playArmedRef.current = false;
        clearPlayRetries();
      }
      preloadStandby();
    },
    [armPlay, clearPlayRetries, preloadStandby],
  );

  const playTrack = useCallback(
    (nextIndex: number, autoplay = true) => {
      if (dismissedRef.current) return;
      const { index: next, uri } = trackUriAt(nextIndex);
      const standby = 1 - activeSlotRef.current;
      const standbyController = controllersRef.current[standby];

      if (standbyController && uriRef.current[standby] === uri) {
        activateSlot(standby, next, autoplay);
        return;
      }

      if (standbyController) {
        loadTrack(standbyController, uri);
        uriRef.current[standby] = uri;
        activateSlot(standby, next, autoplay);
        return;
      }

      const current = activeController();
      if (!current) return;
      loadTrack(current, uri);
      uriRef.current[activeSlotRef.current] = uri;
      activateSlot(activeSlotRef.current, next, autoplay);
    },
    [activateSlot, activeController],
  );

  const requestPlay = useCallback(() => {
    dismissedRef.current = false;
    pendingPlayRef.current = true;
    setActivated(true);
    const controller = activeController();
    if (controller) armPlay(controller);
  }, [activeController, armPlay]);

  const skip = useCallback(
    (direction: 1 | -1) => {
      if (!ready) {
        if (activated) return;
        const { index: next } = trackUriAt(indexRef.current + direction);
        indexRef.current = next;
        setIndex(next);
        requestPlay();
        return;
      }
      pendingPlayRef.current = true;
      playTrack(indexRef.current + direction, true);
    },
    [activated, playTrack, ready, requestPlay],
  );

  const toggle = useCallback(() => {
    if (loading) return;
    if (playing) {
      pendingPlayRef.current = false;
      playArmedRef.current = false;
      clearPlayRetries();
      const controller = activeController();
      if (controller) pausePlayback(controller);
      setPlaying(false);
      return;
    }
    requestPlay();
  }, [activeController, clearPlayRetries, loading, playing, requestPlay]);

  const dismiss = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      dismissedRef.current = true;
      pendingPlayRef.current = false;
      playArmedRef.current = false;
      clearPlayRetries();
      controllersRef.current.forEach((controller) => {
        if (controller) pausePlayback(controller);
      });
      setPlaying(false);
      setVinylOpen(false);
    },
    [clearPlayRetries],
  );

  const restore = useCallback(() => {
    setVinylOpen(true);
  }, []);

  useEffect(() => {
    dismissedRef.current = !visible;
  }, [visible]);

  useEffect(() => {
    if (!hostEl || !activated) return;
    let cancelled = false;
    const iframeObserver = prepareSpotifyIframe(hostEl);

    const bind = (controller: EmbedController, slot: number) => {
      if (cancelled) {
        controller.destroy();
        return;
      }
      controllersRef.current[slot] = controller;

      controller.addListener('ready', () => {
        if (cancelled || slot !== activeSlotRef.current) return;
        const wanted = trackUriAt(indexRef.current).uri;
        if (uriRef.current[slot] !== wanted) {
          loadTrack(controller, wanted);
          uriRef.current[slot] = wanted;
        }
        loadedAtRef.current = Date.now();
        setReady(true);
        if (pendingPlayRef.current && !dismissedRef.current) armPlay(controller);
        preloadStandby();
      });

      controller.addListener('playback_update', (event) => {
        if (cancelled || dismissedRef.current) return;
        if (slot !== activeSlotRef.current) return;

        const { isPaused, isBuffering, duration, position, playingURI } =
          event.data;
        setPlaying(!isPaused);

        if (playingURI) {
          const id = playingURI.split(':').at(-1);
          const found = spotifyTracks.findIndex((item) => item.id === id);
          if (found >= 0 && found !== indexRef.current) {
            indexRef.current = found;
            setIndex(found);
          }
        }

        if (!isPaused) {
          unlockedRef.current = true;
          pendingPlayRef.current = false;
          playArmedRef.current = false;
          clearPlayRetries();
        } else if (playArmedRef.current && !isBuffering) {
          startPlayback(controller);
        }

        const nearEnd = duration > 5000 && position >= duration * 0.97;
        const justLoaded = Date.now() - loadedAtRef.current < 2000;
        if (nearEnd && !justLoaded) {
          if (!endedRef.current) {
            endedRef.current = true;
            playTrack(indexRef.current + 1, true);
          }
        } else if (!nearEnd) {
          endedRef.current = false;
        }
      });
    };

    const mount = (api: IFrameAPI) => {
      if (cancelled || controllersRef.current[0]) return;
      hostEl.replaceChildren();

      const first = trackUriAt(indexRef.current);
      const second = trackUriAt(indexRef.current + 1);
      uriRef.current = [first.uri, second.uri];

      [0, 1].forEach((slot) => {
        const element = document.createElement('div');
        element.style.cssText = 'position:absolute;inset:0';
        hostEl.appendChild(element);
        api.createController(
          element,
          { uri: uriRef.current[slot], width: 160, height: 160 },
          (controller) => bind(controller, slot),
        );
      });
    };

    ensureSpotifyIframeApi(mount);

    return () => {
      cancelled = true;
      iframeObserver.disconnect();
      clearPlayRetries();
      controllersRef.current.forEach((controller) => controller?.destroy());
      controllersRef.current = [null, null];
    };
  }, [activated, armPlay, clearPlayRetries, hostEl, playTrack, preloadStandby]);

  return (
    <>
      <div
        ref={setHostEl}
        className="pointer-events-none fixed top-0 left-0 -z-10 h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      />
      <AnimatePresence mode="wait">
        {visible === null ? null : visible ? (
          <motion.aside
            key="koma-vinyl"
            className="pointer-events-none fixed right-0 bottom-3 z-40 sm:bottom-5 md:top-1/2 md:bottom-auto md:-translate-y-1/2"
            aria-label={t('label')}
            initial={{ x: 56, scale: 0.92 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: 72, opacity: 0, scale: 0.82 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                'vinyl-dock group pointer-events-auto relative flex items-center',
                dragging && 'is-dragging',
              )}
              style={
                {
                  '--vinyl-x': `${offset.x}px`,
                  '--vinyl-y': `${offset.y}px`,
                } as React.CSSProperties
              }
              onPointerDown={onDockPointerDown}
              onPointerMove={onDockPointerMove}
              onPointerUp={endDockDrag}
              onPointerCancel={endDockDrag}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocusCapture={() => setHovered(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setHovered(false);
                }
              }}
            >
              <div className="mr-2 max-w-[7.5rem] text-right">
                <p className="text-[9px] tracking-[0.28em] text-gold uppercase">
                  Koma Amed
                </p>
                <p className="font-display mt-0.5 text-base leading-tight text-fg">
                  {track.title}
                </p>
                <p className="mt-0.5 text-[10px] text-fg-muted">{track.album}</p>
              </div>

              <div className="relative size-[128px] sm:size-[148px] md:size-[164px]">
                <div
                  className={cn(
                    'vinyl-disc absolute inset-0 z-[1] rounded-full',
                    playing && 'is-playing',
                  )}
                  aria-hidden="true"
                >
                  <div className="absolute inset-[31%] overflow-hidden rounded-full border border-gold/35 bg-bg-elevated shadow-[inset_0_0_18px_rgba(0,0,0,0.55)]">
                    <SharpImage
                      src={track.cover}
                      alt=""
                      fill
                      sizes="70px"
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg shadow-[0_0_0_2px_rgba(201,164,92,0.5)]" />
                </div>

                <div
                  className={cn(
                    'vinyl-arm absolute -top-2 right-6 z-10 h-16 w-10 sm:right-7 sm:h-[4.5rem] md:h-20',
                    playing && 'is-playing',
                  )}
                  aria-hidden="true"
                >
                  <span className="absolute top-0 left-0 size-2.5 rounded-full border border-gold/70 bg-gold/30" />
                  <span className="absolute top-1 left-[4px] h-[70%] w-[2px] origin-top rounded-full bg-linear-to-b from-gold-bright to-gold/40" />
                  <span className="absolute bottom-1.5 left-0 h-3 w-3.5 rounded-sm bg-terracotta/90 shadow-[0_0_12px_rgba(196,92,58,0.45)]" />
                </div>

                <button
                  type="button"
                  className={cn(
                    'absolute top-1 left-1 z-30 inline-flex size-6 items-center justify-center rounded-full border border-gold/40 bg-bg/85 text-fg shadow-md backdrop-blur-md transition-opacity hover:bg-gold hover:text-bg md:size-7',
                    showDismiss ? 'opacity-100' : 'opacity-0',
                  )}
                  onClick={dismiss}
                  aria-label={t('dismiss')}
                >
                  <X className="size-3 md:size-3.5" strokeWidth={2.5} />
                </button>

                <div className="absolute inset-x-0 bottom-[12%] z-20 flex flex-col items-center gap-1">
                  <div className="flex touch-manipulation items-center gap-0.5 rounded-full border border-gold/35 bg-bg/80 px-1 py-0.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-fg transition-colors hover:text-gold disabled:opacity-40 disabled:hover:text-fg sm:size-7"
                      onClick={() => skip(-1)}
                      disabled={loading}
                      aria-label={t('previous')}
                    >
                      <SkipBack className="size-3 sm:size-3.5" fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-7 items-center justify-center rounded-full bg-gold text-bg transition-colors hover:bg-gold-bright aria-busy:cursor-wait sm:size-8"
                      onClick={toggle}
                      aria-busy={loading}
                      aria-label={loading ? t('loading') : playing ? t('pause') : t('play')}
                    >
                      {loading ? (
                        <LoaderCircle className="size-3.5 animate-spin sm:size-4" strokeWidth={2.5} />
                      ) : playing ? (
                        <Pause className="size-3 sm:size-3.5" fill="currentColor" />
                      ) : (
                        <Play className="size-3 translate-x-px sm:size-3.5" fill="currentColor" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-fg transition-colors hover:text-gold disabled:opacity-40 disabled:hover:text-fg sm:size-7"
                      onClick={() => skip(1)}
                      disabled={loading}
                      aria-label={t('next')}
                    >
                      <SkipForward className="size-3 sm:size-3.5" fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        ) : (
          <motion.button
            key="koma-vinyl-restore"
            type="button"
            className="fixed right-3 bottom-3 z-40 inline-flex size-11 items-center justify-center rounded-full border border-gold/45 bg-bg/85 text-gold shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors hover:bg-gold hover:text-bg sm:bottom-5 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:right-4"
            onClick={restore}
            aria-label={t('restore')}
            initial={{ x: 28, scale: 0.8 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: 28, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Disc3 className="size-5" strokeWidth={1.75} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
