import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT } from '../constants/content';
import { getLenis } from '../hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

const ArrowIcon = () => (
  <svg className="cl-arrow" viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
    <path d="M7 17L17 7M17 7H8M17 7v9" />
  </svg>
);

export default function Contact() {
  useEffect(() => {
    const sts: ScrollTrigger[] = [];

    (gsap.utils.toArray('[data-ct]') as HTMLElement[]).forEach((el, i) => {
      const t = gsap.fromTo(el, { yPercent: 110 }, {
        yPercent: 0,
        duration: 1.1,
        ease: 'expo.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: '.contact-title',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
      if (t.scrollTrigger) sts.push(t.scrollTrigger);
    });

    const t1 = gsap.from('.c-link', {
      opacity: 0,
      y: 34,
      duration: 0.9,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-links',
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
    if (t1.scrollTrigger) sts.push(t1.scrollTrigger);

    const t2 = gsap.from('.footer', {
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 96%',
        toggleActions: 'play none none reverse',
      },
    });
    if (t2.scrollTrigger) sts.push(t2.scrollTrigger);

    return () => {
      sts.forEach((st) => st.kill());
    };
  }, []);

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { tag, title, links, footer } = CONTACT;

  return (
    <section className="contact section" id="contact">
      <div className="contact-glow" />
      <div className="sec-tag">
        ( {tag.num} ) — <em>{tag.en}</em> {tag.cn}
      </div>

      <h2 className="contact-title">
        <span className="row">
          <span data-ct="">{title.row1}</span>
        </span>
        <span className="row">
          <span data-ct="" className="accent">{title.row2}</span>
        </span>
      </h2>

      <div className="contact-links">
        {links.map((link) => (
          <a
            key={link.num}
            className="c-link"
            href={link.href}
            target={link.href.startsWith('mailto') ? undefined : '_blank'}
            rel={link.href.startsWith('mailto') ? undefined : 'noopener'}
            data-cursor="link"
          >
            <span className="cl-name">
              <span className="idx">{link.num}</span>
              {link.name}
            </span>
            <span className="cl-note">{link.note}</span>
            <ArrowIcon />
          </a>
        ))}
      </div>

      <footer className="footer">
        <span className="f-top">
          <i />
          {footer.status}
        </span>
        <span>{footer.copyright}</span>
        <a href="#top" className="to-top" data-cursor="link" onClick={handleBackToTop}>
          {footer.backToTop}
        </a>
      </footer>
    </section>
  );
}
