import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor({ active }: { active: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    const onMouseMove = (e: MouseEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const onMouseOver = (e: Event) => {
      const target = e.target as HTMLElement;
      const view = target.closest('[data-cursor="view"]');
      const link = target.closest('[data-cursor="link"], a, button');
      ring.classList.toggle('is-view', !!view);
      ring.classList.toggle('is-link', !view && !!link);
      if (view && label) {
        label.textContent = (view as HTMLElement).dataset.cursorLabel || 'VIEW';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label">VIEW</span>
      </div>
    </>
  );
}
