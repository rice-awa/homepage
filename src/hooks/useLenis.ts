import { useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function useLenis(reduced: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time: number) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    lenisInstance = lenis;
    lenisRef.current = lenis;

    return () => {
      gsap.ticker.remove((time: number) => lenis.raf(time * 1000));
      lenis.destroy();
      lenisInstance = null;
      lenisRef.current = null;
    };
  }, [reduced]);

  return lenisRef;
}

export function getLenis() {
  return lenisInstance;
}
