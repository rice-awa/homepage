import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MANIFESTO } from '../constants/content';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const footRef = useRef<HTMLParagraphElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      linesRef.current.forEach((line) => {
        if (!line) return;
        const inner = line.querySelector('.m-line-inner');
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

      gsap.from('.sec-tag', {
        opacity: 0,
        x: -30,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: tagRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const { tag, lines, foot } = MANIFESTO;

  return (
    <section className="manifesto section">
      <div ref={tagRef} className="sec-tag">
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

      <p ref={footRef} className="m-foot">
        {foot.prefix}
        <strong>{foot.highlights[0]}</strong>
        {' '}到{' '}
        <strong>{foot.highlights[1]}</strong>
        {foot.suffix}
      </p>
    </section>
  );
}
