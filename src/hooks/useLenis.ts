import { useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  connectLenisTicker,
  shouldEnableSmoothScroll,
} from './lenisLifecycle.js';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function useLenis(reduced: boolean, isTouch: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    if (!shouldEnableSmoothScroll(reduced, isTouch)) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);
    const disconnectTicker = connectLenisTicker(lenis, gsap.ticker);
    gsap.ticker.lagSmoothing(0);

    lenisInstance = lenis;
    lenisRef.current = lenis;

    return () => {
      disconnectTicker();
      lenis.destroy();
      lenisInstance = null;
      lenisRef.current = null;
    };
  }, [reduced, isTouch]);

  return lenisRef;
}

export function getLenis() {
  return lenisInstance;
}
