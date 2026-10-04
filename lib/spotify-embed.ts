export const SPOTIFY_IFRAME_API_SRC =
  'https://open.spotify.com/embed/iframe-api/v1';

export type PlaybackUpdate = {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    duration: number;
    position: number;
    playingURI?: string;
  };
};

export type EmbedController = {
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

export type IFrameAPI = {
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

export function isGestureLockedBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOS =
    /iP(hone|ad|od)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (iOS) return true;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function readSessionFlag(key: string) {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeSessionFlag(key: string, on: boolean) {
  try {
    if (on) sessionStorage.setItem(key, '1');
    else sessionStorage.removeItem(key);
  } catch {
    /* Safari private mode can block storage */
  }
}

export function ensureSpotifyIframeApi(onReady: (api: IFrameAPI) => void) {
  if (window.__KOMA_SPOTIFY_IFRAME_API__) {
    onReady(window.__KOMA_SPOTIFY_IFRAME_API__);
    return;
  }

  const previous = window.onSpotifyIframeApiReady;
  window.onSpotifyIframeApiReady = (api) => {
    window.__KOMA_SPOTIFY_IFRAME_API__ = api;
    previous?.(api);
    onReady(api);
  };

  if (document.querySelector(`script[src="${SPOTIFY_IFRAME_API_SRC}"]`)) return;

  const script = document.createElement('script');
  script.src = SPOTIFY_IFRAME_API_SRC;
  script.async = true;
  document.body.appendChild(script);
}

export function loadTrack(controller: EmbedController, uri: string) {
  if (typeof controller.loadEntity === 'function') {
    controller.loadEntity(uri, false, 0);
    return;
  }
  controller.loadUri(uri, false, 0);
}

export function startPlayback(controller: EmbedController) {
  try {
    controller.play();
  } catch {
    /* controller may not be ready yet */
  }
  try {
    controller.resume?.();
  } catch {
    /* resume is optional on older embeds */
  }
}

export function prepareSpotifyIframe(root: HTMLElement) {
  const apply = (iframe: HTMLIFrameElement) => {
    iframe.setAttribute(
      'allow',
      'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share',
    );
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('playsinline', 'true');
    iframe.setAttribute('webkit-playsinline', 'true');
    iframe.style.opacity = '1';
    iframe.style.visibility = 'visible';
    iframe.style.pointerEvents = 'none';
  };

  const existing = root.querySelector('iframe');
  if (existing) apply(existing);

  const observer = new MutationObserver(() => {
    root.querySelectorAll('iframe').forEach(apply);
  });
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}
