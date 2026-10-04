type VinylEngine = {
  playFromGesture: () => boolean;
  isReady: () => boolean;
};

let engine: VinylEngine | null = null;
let ready = false;
const readyListeners = new Set<() => void>();

export function registerVinylEngine(next: VinylEngine | null) {
  engine = next;
}

export function playVinylFromGesture() {
  return engine?.playFromGesture() ?? false;
}

export function isVinylReady() {
  return ready;
}

export function setVinylReady(next: boolean) {
  if (ready === next) return;
  ready = next;
  readyListeners.forEach((listener) => listener());
}

export function subscribeVinylReady(listener: () => void) {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}
