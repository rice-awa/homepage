import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

function splitChars(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent || '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const frag = document.createDocumentFragment();
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    frag.appendChild(s);
  }
  el.appendChild(frag);
  return [...el.querySelectorAll('.char')] as HTMLSpanElement[];
}

interface LoaderProps {
  onLoaded: () => void;
  reduced: boolean;
}

export default function Loader({ onLoaded, reduced }: LoaderProps) {
  const [hidden, setHidden] = useState(reduced);
  const nameRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      onLoaded();
      return;
    }

    const loader = containerRef.current;
    const nameEl = nameRef.current;
    const pctEl = pctRef.current;
    const barFillEl = barRef.current;
    if (!loader || !nameEl || !pctEl || !barFillEl) return;

    nameEl.textContent = 'RICEAWA';
    const nameChars = splitChars(nameEl);
    gsap.set(nameChars, { yPercent: 120 });
    gsap.to(nameChars, {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.045,
      ease: 'expo.out',
      delay: 0.15,
    });

    const prog = { v: 0 };
    gsap.to(prog, {
      v: 100,
      duration: 1.9,
      ease: 'power2.inOut',
      onUpdate() {
        pctEl.textContent = String(Math.round(prog.v)).padStart(3, '0');
        gsap.set(barFillEl, { scaleX: prog.v / 100 });
      },
      onComplete() {
        gsap.to(loader, {
          yPercent: -100,
          duration: 0.9,
          ease: 'expo.inOut',
          onComplete() {
            setHidden(true);
            onLoaded();
          },
        });
      },
    });
  }, [reduced, onLoaded]);

  if (hidden) return null;

  return (
    <div ref={containerRef} className="loader" id="loader">
      <div ref={nameRef} className="loader-name" id="loaderName" />
      <div className="loader-bar">
        <i ref={barRef} id="loaderBarFill" />
      </div>
      <div className="loader-pct">
        LOADING — <em ref={pctRef} id="loaderPct">000</em> %
      </div>
    </div>
  );
}
