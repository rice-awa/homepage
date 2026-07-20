import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../hooks/useLenis';
import { NAV } from '../constants/content';

gsap.registerPlugin(ScrollTrigger);

interface NavProps {
  clock: string;
}

export default function Nav({ clock }: NavProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
          navRef.current?.classList.toggle('is-scrolled', self.scroll() > 60);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const handleScroll = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(href, { offset: 0, duration: 1.4 });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav ref={navRef} className="nav" id="nav">
      <a href="#top" className="nav-logo" data-cursor="link" onClick={handleLogoClick}>
        <i />{NAV.logo}
      </a>
      <div className="nav-links">
        {NAV.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-cursor="link"
            onClick={(e) => handleScroll(e, link.href)}
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="nav-time">
        LOCAL — <em id="clock">{clock}</em>
      </div>
    </nav>
  );
}
