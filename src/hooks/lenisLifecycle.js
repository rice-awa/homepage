/**
 * @param {boolean} reduced
 * @param {boolean} isTouch
 */
export function shouldEnableSmoothScroll(reduced, isTouch) {
  return !reduced && !isTouch;
}

/**
 * @param {{ raf(time: number): void }} lenis
 * @param {{
 *   add(callback: (time: number) => void): void,
 *   remove(callback: (time: number) => void): void,
 * }} ticker
 */
export function connectLenisTicker(lenis, ticker) {
  const update = time => lenis.raf(time * 1000);
  ticker.add(update);

  return () => ticker.remove(update);
}
