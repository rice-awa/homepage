import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
          gsap.set('#progressBar', { scaleX: self.progress });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="progress">
      <div ref={barRef} className="progress-bar" id="progressBar" />
    </div>
  );
}
