import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MANIFESTO } from '../constants/content';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      linesRef.current.forEach((line) => {
        if (!line) return;
        const inner = line.querySelector('.m-line-inner');
        if (!inner) return;
        gsap.fromTo(
          inner,
          { yPercent: 105 },
          {
            yPercent: 0,
            ease: 'power3.out',
            duration: 1,
            scrollTrigger: {
              trigger: line,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      gsap.from('.m-foot', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.m-foot',
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const { tag, lines, foot } = MANIFESTO;

  return (
    <section ref={sectionRef} className="manifesto section">
      <div className="sec-tag">
        ( {tag.num} ) — <em>{tag.en}</em> {tag.cn}
      </div>

      {lines.map((line, i) => (
        <div
          key={i}
          className="m-line"
          ref={(el) => { linesRef.current[i] = el; }}
        >
          <div className="m-line-inner">
            <span>
              {line.en.map((part, j) =>
                j === line.accentIdx ? (
                  <span key={j} className="accent">{part}</span>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            </span>
            <span className="cn">{line.cn}</span>
          </div>
        </div>
      ))}

      <p className="m-foot">
        {foot.prefix}
        <strong>{foot.highlights[0]}</strong>
        {' '}到{' '}
        <strong>{foot.highlights[1]}</strong>
        {foot.suffix}
      </p>
    </section>
  );
}
