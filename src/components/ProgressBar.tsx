import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let st: ScrollTrigger | null = null;

    st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        gsap.set('#progressBar', { scaleX: self.progress });
      },
    });

    return () => {
      st?.kill();
    };
  }, []);

  return (
    <div className="progress">
      <div ref={barRef} className="progress-bar" id="progressBar" />
    </div>
  );
}
