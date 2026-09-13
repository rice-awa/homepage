import { useEffect, useRef, useState } from 'react';
import { STACK } from '../constants/content';

function Marquee({ items, reverse = false, compact = false }: {
  items: string[];
  reverse?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`marquee${compact ? ' marquee-agents' : ''}`}>
      <div className={`marquee-track${reverse ? ' is-reversed' : ''}`}>
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {items.map((item, i) => (
              <span key={item} className="marquee-item">
                <span className={i % 2 ? 'hollow' : ''}>{item}</span>
                <i className="dot" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stack({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (sectionRef.current) observer.observe(sectionRef.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <section ref={sectionRef} className="stack section" id="stack"
      data-paused={paused || !visible || !pageVisible} data-reduced={reduced}>
      <div className="stack-heading">
        <div className="sec-tag">
          ( {STACK.tag.num} ) — <em>{STACK.tag.en}</em> {STACK.tag.cn}
        </div>
        {!reduced && (
          <button type="button" className="marquee-toggle" data-cursor="link"
            aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? STACK.resumeLabel : STACK.pauseLabel}
          </button>
        )}
      </div>
      <Marquee items={STACK.marquee1} />
      <Marquee items={STACK.marquee2} reverse />
      {STACK.agents.items.length > 0 && (
        <div className="agent-tools" role="group" aria-labelledby="agent-tools-title">
          <div className="agent-tools-heading">
            <h3 id="agent-tools-title">{STACK.agents.title}</h3>
            <p>{STACK.agents.description}</p>
          </div>
          <Marquee items={STACK.agents.items} compact />
        </div>
      )}
      <div className="marquee-foot">
        {STACK.foot.map((foot) => (
          <div key={foot.label}><strong>{foot.label}</strong>{foot.text}</div>
        ))}
      </div>
    </section>
  );
}
