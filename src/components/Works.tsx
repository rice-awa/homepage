import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORKS } from '../constants/content';

gsap.registerPlugin(ScrollTrigger);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
    <path d="M7 17L17 7M17 7H8M17 7v9" />
  </svg>
);

interface WorkItemProps {
  item: (typeof WORKS.items)[0];
}

function WorkCard({ item }: WorkItemProps) {
  return (
    <article className="work-card" data-cursor="view">
      {item.image ? (
        <div className="work-cover">
          <img src={item.image} alt={`${item.name} 项目封面`} />
          <div className="veil" />
        </div>
      ) : (
        <div
          className="work-cover cover-gen"
          style={
            {
              '--cg': item.coverGen!.cg,
              '--cg-strong': item.coverGen!.cgStrong,
            } as React.CSSProperties
          }
        >
          <div className="cg-grid" />
          <span className="cg-title">
            {item.coverGen!.line1}
            <br />
            <em>{item.coverGen!.line2}</em>
          </span>
          <span className="cg-meta">
            {item.coverGen!.meta[0]}
            <br />
            {item.coverGen!.meta[1]}
          </span>
          <span className="cg-num">{item.num}</span>
        </div>
      )}
      <div className="work-info">
        <div className="wi-l">
          <span className="work-num">P.{item.num} — {item.year}</span>
          <h3 className="work-name">{item.name}</h3>
          <ul className="work-tags">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className="work-desc">{item.desc}</p>
        </div>
        <a
          className="work-link"
          href={item.link}
          target="_blank"
          rel="noopener"
          data-cursor="link"
          data-magnetic="true"
          aria-label={`查看 ${item.name}`}
        >
          <ArrowIcon />
        </a>
      </div>
    </article>
  );
}

export default function Works() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const track = trackRef.current;
    if (!track) return;

    const cards = gsap.utils.toArray('.work-card') as HTMLElement[];
    const worksNow = document.getElementById('worksNow');
    const worksTotal = document.getElementById('worksTotal');
    const progressFill = document.getElementById('worksProgressFill');
    if (worksTotal) worksTotal.textContent = String(cards.length).padStart(2, '0');

    const getDist = () => track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      const scrollTween = gsap.to(track, {
        x: () => -getDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: '#works',
          start: 'top top',
          end: () => '+=' + getDist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate(self) {
            gsap.set(progressFill, { scaleX: self.progress });
            const idx = Math.min(
              cards.length,
              Math.max(1, Math.round(self.progress * (cards.length + 1.6) - 0.4)),
            );
            if (worksNow) worksNow.textContent = String(idx).padStart(2, '0');
          },
        },
      });

      gsap.utils.toArray('.work-cover img').forEach((img) => {
        const el = img as HTMLImageElement;
        gsap.fromTo(
          el,
          { x: 0 },
          {
            x: () => -(el.clientWidth * 0.1),
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('.work-card'),
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotate: i % 2 ? 0.8 : -0.8 },
          {
            rotate: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'left 30%',
              scrub: true,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="works section" id="works">
      <div className="works-pin" id="worksPin">
        <div ref={trackRef} className="works-track" id="worksTrack">
          <div className="work-intro">
            <div className="sec-tag">
              ( {WORKS.tag.num} ) — <em>{WORKS.tag.en}</em> {WORKS.tag.cn}
            </div>
            <h2>
              {WORKS.title.line1}
              <br />
              <span className="outline">{WORKS.title.line2}</span>
            </h2>
            <p>{WORKS.desc}</p>
            <div className="drag">
              <span className="line" />
              <span>SCROLL TO EXPLORE</span>
            </div>
          </div>

          {WORKS.items.map((item) => (
            <WorkCard key={item.id} item={item} />
          ))}

          <div className="work-outro">
            <h3>
              {WORKS.outro.line1}
              <br />
              {WORKS.outro.line2}
            </h3>
            <a
              href={WORKS.outro.link}
              target="_blank"
              rel="noopener"
              data-cursor="link"
            >
              {WORKS.outro.linkLabel}
            </a>
          </div>
        </div>

        <div className="works-counter">
          <em id="worksNow">01</em> / <span id="worksTotal">05</span>
        </div>
        <div className="works-progress">
          <i id="worksProgressFill" />
        </div>
      </div>
    </section>
  );
}
