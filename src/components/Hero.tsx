import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { HERO } from '../constants/content';

const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

const RIBBONS = [
  { c: [34, 211, 238], y: 0.3, amp: 0.11, freq: 1.15, speed: 0.00016, w: 0.16, drift: 0.02, ph: 0.0 },
  { c: [59, 130, 246], y: 0.48, amp: 0.15, freq: 0.85, speed: 0.00011, w: 0.22, drift: 0.032, ph: 2.1 },
  { c: [45, 212, 191], y: 0.66, amp: 0.1, freq: 1.35, speed: 0.00021, w: 0.13, drift: 0.016, ph: 4.2 },
  { c: [14, 165, 233], y: 0.84, amp: 0.13, freq: 0.7, speed: 0.00009, w: 0.18, drift: 0.026, ph: 5.6 },
];

interface HeroProps {
  isTouch: boolean;
  reduced: boolean;
  loaded: boolean;
}

function splitCharsHero(el: HTMLElement) {
  const text = el.textContent || '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
  }
}

export default function Hero({ isTouch, reduced, loaded }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const strokeRef = useRef<HTMLSpanElement>(null);
  const cnRef = useRef<HTMLParagraphElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    navRef.current = document.getElementById('nav');
  }, []);

  useEffect(() => {
    const title = titleRef.current;
    const stroke = strokeRef.current;
    if (!title || !stroke) return;

    splitCharsHero(title);

    if (reduced) {
      const chars = title.querySelectorAll('.char');
      gsap.set([chars, stroke], { yPercent: 0 });
      return;
    }

    const chars = title.querySelectorAll('.char');
    gsap.set(chars, { yPercent: 115 });
    gsap.set(stroke, { yPercent: 115 });
  }, [reduced]);

  useEffect(() => {
    if (!loaded) return;

    const title = titleRef.current;
    const stroke = strokeRef.current;
    const cn = cnRef.current;
    const foot = footRef.current;
    const nav = navRef.current;

    if (!title || !stroke) return;
    if (reduced) return;

    const chars = title.querySelectorAll('.char');

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(chars, { yPercent: 0, duration: 1.3, stagger: 0.05 }, 0)
      .to(stroke, { yPercent: 0, duration: 1.1 }, 0.35)
      .to(cn, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.7)
      .to(nav, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
      .to(foot, { opacity: 1, duration: 0.9 }, 1);
  }, [loaded, reduced]);

  const drawRibbons = useCallback((t: number, dpr: number, ribbons: typeof RIBBONS) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const CW = parent.clientWidth;
    const CH = parent.clientHeight;
    const width = Math.round(CW * dpr);
    const height = Math.round(CH * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    ctx.globalCompositeOperation = 'lighter';

    for (const r of ribbons) {
      const baseY = r.y * CH;
      ctx.beginPath();
      const STEPS = 48;
      for (let i = 0; i <= STEPS; i++) {
        const x = (i / STEPS) * (CW + 200) - 100;
        const n = i / STEPS;
        const y =
          baseY +
          Math.sin(n * Math.PI * r.freq * 2 + t * r.speed + r.ph) * r.amp * CH +
          Math.sin(n * Math.PI * r.freq * 4.7 + t * r.speed * 1.6 + r.ph * 2) * r.amp * CH * 0.35;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const thick = r.w * CH * (1 + 0.12 * Math.sin(t * r.speed * 2 + r.ph));
      const g = ctx.createLinearGradient(0, baseY - thick, 0, baseY + thick);
      const [R, G, B] = r.c;
      g.addColorStop(0, `rgba(${R},${G},${B},0)`);
      g.addColorStop(0.5, `rgba(${R},${G},${B},.55)`);
      g.addColorStop(1, `rgba(${R},${G},${B},0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  useEffect(() => {
    // 移动端性能降级：DPR 降为 1、只画 2 条彩带、帧率限制 30fps
    const dpr = isTouch ? 1 : DPR;
    const ribbons = isTouch ? RIBBONS.slice(0, 2) : RIBBONS;

    if (reduced) {
      drawRibbons(0, dpr, ribbons);
      return;
    }

    let heroVisible = true;
    const heroEl = document.getElementById('hero');
    const observer = new IntersectionObserver(
      ([e]) => {
        heroVisible = e.isIntersecting;
      },
      { threshold: 0 },
    );
    if (heroEl) observer.observe(heroEl);

    const FRAME = 1000 / 30;
    let last = -FRAME;
    let rafId: number;
    const loop = (t: number) => {
      if (heroVisible && (!isTouch || t - last >= FRAME)) {
        last = t;
        drawRibbons(t, dpr, ribbons);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [reduced, isTouch, drawRibbons]);

  useEffect(() => {
    if (isTouch || reduced) return;
    const bg = bgRef.current;
    const inner = innerRef.current;
    if (!bg || !inner) return;

    const bx = gsap.quickTo(bg, 'x', { duration: 0.9, ease: 'power3' });
    const by = gsap.quickTo(bg, 'y', { duration: 0.9, ease: 'power3' });
    const cx = gsap.quickTo(inner, 'x', { duration: 0.9, ease: 'power3' });
    const cy = gsap.quickTo(inner, 'y', { duration: 0.9, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      bx(nx * 34);
      by(ny * 24);
      cx(nx * -18);
      cy(ny * -12);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isTouch, reduced]);

  return (
    <section className="hero" id="hero">
      <div ref={bgRef} className="hero-bg" id="heroBg">
        <canvas ref={canvasRef} id="ribbons" />
      </div>
      <div className="hero-grid" />
      <div className="hero-coord">{HERO.coord}</div>
      <div ref={innerRef} className="hero-inner" id="heroInner">
        <div className="hero-eyebrow">
          <span className="dash" />
          <span>{HERO.eyebrow}</span>
        </div>
        <div className="hero-title-mask">
          <h1 ref={titleRef} className="hero-title" id="heroTitle">
            {HERO.title}
          </h1>
        </div>
        <div className="hero-sub">
          <span className="stroke">
            <span ref={strokeRef} id="heroStroke">{HERO.stroke}</span>
          </span>
          <p ref={cnRef} className="hero-cn" id="heroCn">
            {HERO.cn.prefix}
            <strong>{HERO.cn.highlights[0]}</strong>
            {' '}到{' '}
            <strong>{HERO.cn.highlights[1]}</strong>
            {HERO.cn.suffix}
          </p>
        </div>
      </div>
      <div ref={footRef} className="hero-foot" id="heroFoot">
        <div className="scroll-hint">
          <span>SCROLL</span>
          <span className="wire" />
        </div>
        <div className="hero-social">
          {HERO.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener" data-cursor="link">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
