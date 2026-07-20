import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT } from '../constants/content';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.avatar-frame', {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.avatar-wrap',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.fromTo(
        '#aboutImg',
        { scale: 1.3 },
        {
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );

      gsap.from(['.about-body h3', '.about-body p'], {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-body',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.stat', {
        opacity: 0,
        y: 26,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.stats',
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      (gsap.utils.toArray('[data-count]') as HTMLElement[]).forEach((el) => {
        const target = Number(el.dataset.count);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.fromTo(el, { textContent: 0 }, {
              textContent: target,
              duration: 1.6,
              ease: 'power2.out',
              snap: { textContent: 1 },
            });
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const { tag, heading, paragraphs, avatar, stats } = ABOUT;

  return (
    <section ref={sectionRef} className="about section" id="about">
      <div className="sec-tag">
        ( {tag.num} ) — <em>{tag.en}</em> {tag.cn}
      </div>

      <div className="about-grid">
        <div className="avatar-wrap">
          <svg className="avatar-ring" viewBox="0 0 150 150">
            <defs>
              <path
                id="ringPath"
                d="M75,75 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0"
              />
            </defs>
            <text>
              <textPath href="#ringPath">{avatar.ringText}</textPath>
            </text>
          </svg>
          <div className="avatar-frame">
            <img src={avatar.src} alt={avatar.alt} id="aboutImg" />
          </div>
          <div className="avatar-caption">
            <span>{avatar.caption[0]}</span>
            <span>{avatar.caption[1]}</span>
          </div>
        </div>

        <div className="about-body">
          <h3>
            {heading.line1}
            <span className="accent">{heading.accent}</span>
            {heading.line2}
            <br />
            {heading.line3}
            <br />
            {heading.line4}
          </h3>

          {paragraphs.map((p, i) => (
            <p key={i}>
              {p.prefix}
              {p.highlights.map((h, j) => (
                <span key={j}>
                  <strong>{h}</strong>
                  {j < p.highlights.length - 1 ? ' 与 ' : ''}
                </span>
              ))}
              {p.suffix}
            </p>
          ))}

          <div className="stats">
            {stats.map((s, i) => (
              <div key={i} className="stat">
                {s.value === -1 ? (
                  <b>∞</b>
                ) : (
                  <b>
                    <em data-count={s.value}>0</em>+
                  </b>
                )}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
