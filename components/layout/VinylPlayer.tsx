'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Disc3, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
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
  prepareSpotifyIframe,
  readSessionFlag,
  startPlayback,
  writeSessionFlag,
} from '@/lib/spotify-embed';
import {
  playVinylFromGesture,
  registerVinylEngine,
  setVinylReady,
} from '@/lib/vinyl-bridge';
import {
  spotifyTrackUri,
  spotifyTrackUrl,
  spotifyTracks,
} from '@/lib/spotify';

const STORAGE_KEY = 'koma-vinyl-dismissed';
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
  return !readSessionFlag(STORAGE_KEY);
}

function closeVinyl() {
  writeSessionFlag(STORAGE_KEY, true);
  vinylListeners.forEach((listener) => listener());
  window.dispatchEvent(new Event('koma-vinyl'));
}

function openVinyl() {
  writeSessionFlag(STORAGE_KEY, false);
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
  const [visible, setVisible] = useState(true);
  const controllersRef = useRef<[EmbedController | null, EmbedController | null]>([
    null,
    null,
  ]);
  const uriRef = useRef<[string, string]>(['', '']);
  const activeSlotRef = useRef(0);
  const indexRef = useRef(0);
  const unlockedRef = useRef(false);
  const endedRef = useRef(false);
  const dismissedRef = useRef(false);
  const loadedAtRef = useRef(0);
  const playArmedRef = useRef(false);
  const gestureOnlyRef = useRef(false);
  const retryTimersRef = useRef<number[]>([]);
  const [hostEl, setHostEl] = useState<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFineHover(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    gestureOnlyRef.current = isGestureLockedBrowser();
    setVisible(vinylIsOpen());
    return subscribeVinyl(() => setVisible(vinylIsOpen()));
  }, []);

  const track = spotifyTracks[index];
  const showDismiss = !fineHover || hovered;

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
      controllersRef.current[other]?.pause();
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

  const skip = useCallback(
    (direction: 1 | -1) => {
      playTrack(indexRef.current + direction, true);
    },
    [playTrack],
  );

  const toggle = useCallback(() => {
    const controller = activeController();
    if (!controller) return;
    if (playing) {
      playArmedRef.current = false;
      clearPlayRetries();
      controller.pause();
      setPlaying(false);
      return;
    }
    armPlay(controller);
  }, [activeController, armPlay, clearPlayRetries, playing]);

  const playFromGesture = useCallback(() => {
    dismissedRef.current = false;
    if (!vinylIsOpen()) openVinyl();
    const controller = activeController();
    if (!controller) return false;
    armPlay(controller);
    return true;
  }, [activeController, armPlay]);

  const dismiss = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      dismissedRef.current = true;
      playArmedRef.current = false;
      clearPlayRetries();
      controllersRef.current.forEach((controller) => controller?.pause());
      setPlaying(false);
      closeVinyl();
    },
    [clearPlayRetries],
  );

  const restore = useCallback(() => {
    playFromGesture();
  }, [playFromGesture]);

  useEffect(() => {
    dismissedRef.current = !visible;
  }, [visible]);

  useEffect(() => {
    registerVinylEngine({
      playFromGesture,
      isReady: () => controllersRef.current.some(Boolean),
    });
    return () => registerVinylEngine(null);
  }, [playFromGesture]);

  useEffect(() => {
    if (!hostEl) return;
    let cancelled = false;
    const iframeObserver = prepareSpotifyIframe(hostEl);

    const bind = (controller: EmbedController, slot: number) => {
      if (cancelled) {
        controller.destroy();
        return;
      }
      controllersRef.current[slot] = controller;

      controller.addListener('ready', () => {
        if (cancelled) return;
        setReady(true);
        setVinylReady(true);
        loadedAtRef.current = Date.now();
        if (slot === activeSlotRef.current && !dismissedRef.current) {
          if (!gestureOnlyRef.current) armPlay(controller);
        }
        if (slot === activeSlotRef.current) preloadStandby();
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
      setVinylReady(false);
    };
  }, [armPlay, clearPlayRetries, hostEl, playTrack, preloadStandby]);

  useEffect(() => {
    if (!visible || !ready || unlockedRef.current) return;

    const unlock = (event: Event) => {
      if (unlockedRef.current || dismissedRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-vinyl-dismiss]')) return;
      if (target?.closest('[data-vinyl-transport]')) return;
      if (target?.closest('[data-vinyl-ignore-unlock]')) return;
      playVinylFromGesture();
    };

    window.addEventListener('pointerup', unlock, { capture: true, passive: true });
    window.addEventListener('click', unlock, { capture: true });
    window.addEventListener('touchend', unlock, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerup', unlock, { capture: true });
      window.removeEventListener('click', unlock, { capture: true });
      window.removeEventListener('touchend', unlock, { capture: true });
    };
  }, [ready, visible]);

  return (
    <>
      <div
        ref={setHostEl}
        className="pointer-events-none fixed right-0 bottom-3 z-0 size-[128px] overflow-hidden rounded-full opacity-100 sm:bottom-5 sm:size-[148px] md:top-1/2 md:bottom-auto md:size-[164px] md:-translate-y-1/2"
        aria-hidden="true"
      />
      {!visible ? (
        <div
          className="pointer-events-none fixed right-0 bottom-3 z-[1] size-[128px] rounded-full bg-bg sm:bottom-5 sm:size-[148px] md:top-1/2 md:bottom-auto md:size-[164px] md:-translate-y-1/2"
          aria-hidden="true"
        />
      ) : null}
      <AnimatePresence mode="wait">
        {visible ? (
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
              className="vinyl-dock group pointer-events-auto relative flex items-center"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocusCapture={() => setHovered(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setHovered(false);
                }
              }}
            >
              <div className="mr-2 hidden max-w-[7.5rem] text-right lg:block">
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
                  data-vinyl-dismiss
                  onClick={dismiss}
                  aria-label={t('dismiss')}
                >
                  <X className="size-3 md:size-3.5" strokeWidth={2.5} />
                </button>

                <div className="absolute inset-x-0 bottom-[12%] z-20 flex flex-col items-center gap-1">
                  <div
                    data-vinyl-transport
                    className="flex touch-manipulation items-center gap-0.5 rounded-full border border-gold/35 bg-bg/80 px-1 py-0.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
                  >
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-fg transition-colors hover:text-gold sm:size-7"
                      onClick={() => skip(-1)}
                      aria-label={t('previous')}
                    >
                      <SkipBack className="size-3 sm:size-3.5" fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-7 items-center justify-center rounded-full bg-gold text-bg transition-colors hover:bg-gold-bright sm:size-8"
                      onClick={toggle}
                      aria-label={playing ? t('pause') : t('play')}
                    >
                      {playing ? (
                        <Pause className="size-3 sm:size-3.5" fill="currentColor" />
                      ) : (
                        <Play className="size-3 translate-x-px sm:size-3.5" fill="currentColor" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-fg transition-colors hover:text-gold sm:size-7"
                      onClick={() => skip(1)}
                      aria-label={t('next')}
                    >
                      <SkipForward className="size-3 sm:size-3.5" fill="currentColor" />
                    </button>
                  </div>
                  <a
                    href={spotifyTrackUrl(track.id)}
                    target="_blank"
                    rel="noreferrer"
                    data-vinyl-ignore-unlock
                    className="max-w-[7rem] truncate text-[8px] tracking-[0.18em] text-gold/80 uppercase hover:text-gold lg:hidden"
                  >
                    {track.title}
                  </a>
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
