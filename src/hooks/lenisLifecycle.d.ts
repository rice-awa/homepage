interface LenisRafTarget {
  raf(time: number): void;
}

interface AnimationTicker {
  add(callback: (time: number) => void): void;
  remove(callback: (time: number) => void): void;
}

export function shouldEnableSmoothScroll(
  reduced: boolean,
  isTouch: boolean,
): boolean;

export function connectLenisTicker(
  lenis: LenisRafTarget,
  ticker: AnimationTicker,
): () => void;
