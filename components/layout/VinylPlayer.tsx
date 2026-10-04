'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Disc3, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { SharpImage } from '@/components/ui/SharpImage';
import { cn } from '@/lib/utils';
import {
  spotifyTrackUri,
  spotifyTrackUrl,
  spotifyTracks,
} from '@/lib/spotify';

type PlaybackUpdate = {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    duration: number;
    position: number;
    playingURI?: string;
  };
};

type EmbedController = {
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  loadUri: (uri: string, preferVideo?: boolean, startAt?: number) => void;
  loadEntity?: (uri: string, preferVideo?: boolean, startAt?: number) => void;
  addListener: (event: string, cb: (event: PlaybackUpdate) => void) => void;
  removeListener: (event: string) => void;
  destroy: () => void;
};

type IFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: number; height: number },
    callback: (controller: EmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
    __KOMA_SPOTIFY_IFRAME_API__?: IFrameAPI;
  }
}

const SCRIPT_SRC = 'https://open.spotify.com/embed/iframe-api/v1';
const STORAGE_KEY = 'koma-vinyl-dismissed';
const vinylListeners = new Set<() => void>();

function loadSpotifyIframeApi() {
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

function loadTrack(controller: EmbedController, uri: string) {
  if (controller.loadEntity) {
    controller.loadEntity(uri, false, 0);
    return;
  }
  controller.loadUri(uri, false, 0);
}

function startPlayback(controller: EmbedController) {
  controller.play();
  controller.resume?.();
}

function enableIframeAutoplay(root: HTMLElement) {
  const apply = (iframe: HTMLIFrameElement) => {
    iframe.setAttribute(
      'allow',
      'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
    );
    iframe.setAttribute('allowfullscreen', 'true');
  };
  const existing = root.querySelector('iframe');
  if (existing) apply(existing);
  const observer = new MutationObserver(() => {
    const iframe = root.querySelector('iframe');
    if (iframe) apply(iframe);
  });
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}

function subscribeVinyl(onStoreChange: () => void) {
  vinylListeners.add(onStoreChange);
  window.addEventListener('koma-vinyl', onStoreChange);
  return () => {
    vinylListeners.delete(onStoreChange);
    window.removeEventListener('koma-vinyl', onStoreChange);
  };
}

function vinylIsOpen() {
  return sessionStorage.getItem(STORAGE_KEY) !== '1';
}

function closeVinyl() {
  sessionStorage.setItem(STORAGE_KEY, '1');
  vinylListeners.forEach((listener) => listener());
  window.dispatchEvent(new Event('koma-vinyl'));
}

function openVinyl() {
  sessionStorage.removeItem(STORAGE_KEY);
  vinylListeners.forEach((listener) => listener());
  window.dispatchEvent(new Event('koma-vinyl'));
}

export function VinylPlayer() {
  const t = useTranslations('Player');
  const [fineHover, setFineHover] = useState(true);
  const [visible, setVisible] = useState(true);
  const controllerRef = useRef<EmbedController | null>(null);
  const indexRef = useRef(0);
  const unlockedRef = useRef(false);
  const endedRef = useRef(false);
  const dismissedRef = useRef(false);
  const loadedAtRef = useRef(0);
  const playArmedRef = useRef(false);
  const retryTimersRef = useRef<number[]>([]);
  const touchGuardRef = useRef(0);
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
    setVisible(vinylIsOpen());
    return subscribeVinyl(() => setVisible(vinylIsOpen()));
  }, []);

  const track = spotifyTracks[index];
  const showDismiss = !fineHover || hovered;

  const clearPlayRetries = useCallback(() => {
    retryTimersRef.current.forEach((id) => window.clearTimeout(id));
    retryTimersRef.current = [];
  }, []);

  const armPlay = useCallback(
    (controller: EmbedController) => {
      playArmedRef.current = true;
      const kick = () => {
        if (!playArmedRef.current || dismissedRef.current) return;
        startPlayback(controller);
      };
      kick();
      clearPlayRetries();
      [80, 200, 400, 800, 1600, 2800, 4500].forEach((ms) => {
        retryTimersRef.current.push(window.setTimeout(kick, ms));
      });
    },
    [clearPlayRetries],
  );

  const playTrack = useCallback(
    (nextIndex: number, autoplay = true) => {
      if (dismissedRef.current) return;
      const next = (nextIndex + spotifyTracks.length) % spotifyTracks.length;
      indexRef.current = next;
      setIndex(next);
      endedRef.current = false;
      loadedAtRef.current = Date.now();
      const controller = controllerRef.current;
      if (!controller) return;
      loadTrack(controller, spotifyTrackUri(spotifyTracks[next].id));
      if (autoplay) {
        armPlay(controller);
      } else {
        playArmedRef.current = false;
        clearPlayRetries();
      }
    },
    [armPlay, clearPlayRetries],
  );

  const skip = useCallback(
    (direction: 1 | -1) => {
      playTrack(indexRef.current + direction, true);
    },
    [playTrack],
  );

  const onTouchTransport = useCallback((action: () => void) => {
    return (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
      event.preventDefault();
      touchGuardRef.current = Date.now();
      action();
    };
  }, []);

  const onClickTransport = useCallback((action: () => void) => {
    return () => {
      if (Date.now() - touchGuardRef.current < 600) return;
      action();
    };
  }, []);

  const toggle = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    unlockedRef.current = true;
    if (playing) {
      playArmedRef.current = false;
      clearPlayRetries();
      controller.pause();
      setPlaying(false);
      return;
    }
    armPlay(controller);
  }, [armPlay, clearPlayRetries, playing]);

  const dismiss = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    dismissedRef.current = true;
    playArmedRef.current = false;
    clearPlayRetries();
    controllerRef.current?.pause();
    setPlaying(false);
    closeVinyl();
  }, [clearPlayRetries]);

  const restore = useCallback(() => {
    dismissedRef.current = false;
    unlockedRef.current = true;
    openVinyl();
    const controller = controllerRef.current;
    if (controller) armPlay(controller);
  }, [armPlay]);

  useEffect(() => {
    dismissedRef.current = !visible;
  }, [visible]);

  useEffect(() => {
    if (!hostEl) return;
    let cancelled = false;
    const iframeObserver = enableIframeAutoplay(hostEl);

    const mount = (api: IFrameAPI) => {
      if (cancelled || controllerRef.current) return;
      hostEl.replaceChildren();
      const element = document.createElement('div');
      hostEl.appendChild(element);

      api.createController(
        element,
        {
          uri: spotifyTrackUri(spotifyTracks[indexRef.current].id),
          width: 300,
          height: 152,
        },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          controllerRef.current = controller;

          controller.addListener('ready', () => {
            setReady(true);
            loadedAtRef.current = Date.now();
            if (!dismissedRef.current) {
              armPlay(controller);
            }
          });

          controller.addListener('playback_update', (event) => {
            if (dismissedRef.current) return;
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
        },
      );
    };

    const previousReady = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      previousReady?.(api);
      window.__KOMA_SPOTIFY_IFRAME_API__ = api;
      mount(api);
    };

    if (window.__KOMA_SPOTIFY_IFRAME_API__) {
      mount(window.__KOMA_SPOTIFY_IFRAME_API__);
    } else {
      loadSpotifyIframeApi();
    }

    return () => {
      cancelled = true;
      iframeObserver.disconnect();
      clearPlayRetries();
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [armPlay, clearPlayRetries, hostEl, playTrack]);

  useEffect(() => {
    if (!visible || !ready || unlockedRef.current) return;

    const unlock = (event: Event) => {
      if (unlockedRef.current || dismissedRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-vinyl-dismiss]')) return;
      const controller = controllerRef.current;
      if (controller) armPlay(controller);
    };

    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    window.addEventListener('touchstart', unlock, { capture: true });
    window.addEventListener('koma-preloader-done', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
      window.removeEventListener('touchstart', unlock, { capture: true });
      window.removeEventListener('koma-preloader-done', unlock);
    };
  }, [armPlay, ready, visible, playing]);

  return (
    <>
      <div
        ref={setHostEl}
        className="pointer-events-none fixed right-0 bottom-3 z-0 size-[128px] overflow-hidden rounded-full opacity-[0.02] sm:bottom-5 sm:size-[148px] md:top-1/2 md:bottom-auto md:size-[164px] md:-translate-y-1/2"
        aria-hidden="true"
      />
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
                  <div className="flex touch-manipulation items-center gap-0.5 rounded-full border border-gold/35 bg-bg/80 px-1 py-0.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-fg transition-colors hover:text-gold sm:size-7"
                      onPointerDown={onTouchTransport(() => skip(-1))}
                      onClick={onClickTransport(() => skip(-1))}
                      aria-label={t('previous')}
                    >
                      <SkipBack className="size-3 sm:size-3.5" fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-7 items-center justify-center rounded-full bg-gold text-bg transition-colors hover:bg-gold-bright sm:size-8"
                      onPointerDown={onTouchTransport(toggle)}
                      onClick={onClickTransport(toggle)}
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
                      onPointerDown={onTouchTransport(() => skip(1))}
                      onClick={onClickTransport(() => skip(1))}
                      aria-label={t('next')}
                    >
                      <SkipForward className="size-3 sm:size-3.5" fill="currentColor" />
                    </button>
                  </div>
                  <a
                    href={spotifyTrackUrl(track.id)}
                    target="_blank"
                    rel="noreferrer"
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
