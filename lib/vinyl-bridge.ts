type VinylEngine = {
  playFromGesture: () => boolean;
};

let engine: VinylEngine | null = null;

export function registerVinylEngine(next: VinylEngine | null) {
  engine = next;
}

export function playVinylFromGesture() {
  return engine?.playFromGesture() ?? false;
}
