import { useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Cursor from './components/Cursor';
import ProgressBar from './components/ProgressBar';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Works from './components/Works';
import Stack from './components/Stack';
import Contributions from './components/Contributions';
import About from './components/About';
import Contact from './components/Contact';
import { useClock } from './hooks/useClock';
import { useLenis } from './hooks/useLenis';
import { SITE, SEO_KEYWORDS } from './constants/content';

gsap.registerPlugin(ScrollTrigger);

function useMedia() {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && matchMedia('(hover: none), (pointer: coarse)').matches,
  );
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mqHover = matchMedia('(hover: none), (pointer: coarse)');
    const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const onHover = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    const onMotion = (e: MediaQueryListEvent) => setReduced(e.matches);
    mqHover.addEventListener('change', onHover);
    mqMotion.addEventListener('change', onMotion);
    return () => {
      mqHover.removeEventListener('change', onHover);
      mqMotion.removeEventListener('change', onMotion);
    };
  }, []);

  return { isTouch, reduced };
}

export default function App() {
  const clock = useClock();
  const { isTouch, reduced } = useMedia();
  const [loaded, setLoaded] = useState(reduced);

  useLenis(reduced, isTouch);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    gsap.to('#heroInner', {
      yPercent: -18,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to('.hero-bg', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.utils.toArray('.sec-tag').forEach((tag) => {
      gsap.from(tag as HTMLElement, {
        opacity: 0,
        x: -30,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: tag as HTMLElement,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  }, [loaded]);

  return (
    <HelmetProvider>
      <Helmet>
        <html lang={SITE.locale} />
        <title>{SITE.title}</title>
        <meta name="description" content={SITE.description} />
        <meta name="keywords" content={SEO_KEYWORDS.join(',')} />
        <meta name="author" content={SITE.author} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE.url} />
        <meta property="og:title" content={SITE.title} />
        <meta property="og:description" content={SITE.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE.url} />
        <meta property="og:site_name" content={SITE.author} />
        <meta property="og:locale" content={SITE.locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE.title} />
        <meta name="twitter:description" content={SITE.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: SITE.author,
            alternateName: 'Creative Developer',
            url: SITE.url,
            jobTitle: '全栈开发者',
            sameAs: [
              'https://github.com/rice-awa',
              'https://space.bilibili.com/521856101',
              'https://blog.rice-awa.top',
            ],
            knowsAbout: ['React', 'TypeScript', 'Python', 'AI Agent', 'Minecraft Modding', 'Full Stack Development'],
          })}
        </script>
      </Helmet>

      <Loader onLoaded={handleLoaded} reduced={reduced} />
      <Cursor active={!isTouch} />
      <ProgressBar />
      <Nav clock={clock} />

      <main id="top">
        <Hero isTouch={isTouch} reduced={reduced} loaded={loaded} />
        <Manifesto />
        <Works />
        <Stack reduced={reduced} />
        <About />
        <Contributions />
        <Contact />
      </main>
    </HelmetProvider>
  );
}
