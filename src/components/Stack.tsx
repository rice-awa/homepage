import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STACK } from '../constants/content';

gsap.registerPlugin(ScrollTrigger);

export default function Stack({ reduced }: { reduced: boolean }) {
  const mq1Ref = useRef<HTMLDivElement>(null);
  const mq2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq1 = mq1Ref.current;
    const mq2 = mq2Ref.current;
    if (!mq1 || !mq2) return;

    const w1 = mq1.scrollWidth / 2;
    const w2 = mq2.scrollWidth / 2;

    const tween1 = gsap.fromTo(
      mq1,
      { x: 0 },
      { x: -w1, duration: 26, ease: 'none', repeat: -1 },
    );
    const tween2 = gsap.fromTo(
      mq2,
      { x: -w2 },
      { x: 0, duration: 26, ease: 'none', repeat: -1 },
    );

    if (!reduced) {
      let mqIdle: ReturnType<typeof setTimeout>;
      ScrollTrigger.create({
        trigger: '.stack',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
          const v = 1 + Math.min(Math.abs(self.getVelocity()) / 2500, 1.6);
          gsap.to(tween1, { timeScale: v, duration: 0.3, overwrite: true });
          gsap.to(tween2, { timeScale: v, duration: 0.3, overwrite: true });
          clearTimeout(mqIdle);
          mqIdle = setTimeout(() => {
            gsap.to(tween1, { timeScale: 1, duration: 0.6, overwrite: true });
            gsap.to(tween2, { timeScale: 1, duration: 0.6, overwrite: true });
          }, 160);
        },
      });
    }

    return () => {
      tween1.kill();
      tween2.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === '.stack') st.kill();
      });
    };
  }, [reduced]);

  const renderMarquee = (items: string[], id: string, ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="marquee">
      <div ref={ref} className="marquee-track" id={id}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="marquee-item">
            <span className={i % 2 ? 'hollow' : ''}>{t}</span>
            <i className="dot" />
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section className="stack section" id="stack">
      <div className="sec-tag">
        ( {STACK.tag.num} ) — <em>{STACK.tag.en}</em> {STACK.tag.cn}
      </div>
      {renderMarquee(STACK.marquee1, 'mq1', mq1Ref)}
      {renderMarquee(STACK.marquee2, 'mq2', mq2Ref)}
      <div className="marquee-foot">
        {STACK.foot.map((f, i) => (
          <div key={i}>
            <strong>{f.label}</strong>
            {f.text}
          </div>
        ))}
      </div>
    </section>
  );
}
