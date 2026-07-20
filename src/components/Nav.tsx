import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../hooks/useLenis';
import { NAV } from '../constants/content';
import { useTheme } from '../hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

interface NavProps {
  clock: string;
}

export default function Nav({ clock }: NavProps) {
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pendingHref = useRef<string | null>(null);
  const firstRun = useRef(true);

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

  // 移动端抽屉：打开/关闭动画 + 滚动锁定（仅 ≤768px 可见，桌面端 display:none）
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    // 跳过首次渲染（CSS 已初始化为隐藏状态）
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const lenis = getLenis();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const links = drawer.querySelectorAll('.nd-link');
    const foot = drawer.querySelector('.nd-foot');

    if (menuOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      if (reduced) {
        gsap.set(drawer, { visibility: 'visible', pointerEvents: 'auto', clipPath: 'inset(0 0 0% 0)' });
        return;
      }
      gsap
        .timeline()
        .set(drawer, { visibility: 'visible', pointerEvents: 'auto' })
        .fromTo(
          drawer,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'expo.inOut' },
        )
        .fromTo(
          links,
          { yPercent: 120 },
          { yPercent: 0, duration: 0.6, stagger: 0.06, ease: 'expo.out' },
          '-=0.25',
        )
        .fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.35');
    } else {
      const finish = () => {
        lenis?.start();
        document.body.style.overflow = '';
        if (pendingHref.current) {
          const href = pendingHref.current;
          pendingHref.current = null;
          if (lenis) {
            lenis.scrollTo(href, { offset: 0, duration: 1.4 });
          } else {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };
      if (reduced) {
        gsap.set(drawer, { visibility: 'hidden', pointerEvents: 'none', clipPath: 'inset(0 0 100% 0)' });
        finish();
        return;
      }
      gsap
        .timeline()
        .to(drawer, { clipPath: 'inset(0 0 100% 0)', duration: 0.38, ease: 'expo.in' })
        .set(drawer, { visibility: 'hidden', pointerEvents: 'none' })
        .call(finish);
    }
  }, [menuOpen]);

  const handleScroll = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(href, { offset: 0, duration: 1.4 });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 抽屉链接点击：先关闭抽屉，关闭动画完成后由 finish() 执行滚动
  const handleDrawerLink = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    pendingHref.current = href;
    setMenuOpen(false);
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
    <>
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
        <div className="nav-end">
          <div className="nav-time">
            LOCAL — <em id="clock">{clock}</em>
          </div>
          <button
            type="button"
            className="theme-toggle"
            data-cursor="link"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            aria-pressed={theme === 'light'}
            onClick={toggleTheme}
          >
            <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
            </svg>
          </button>
          <button
            type="button"
            className={`nav-burger${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="nav-drawer"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div ref={drawerRef} className="nav-drawer" id="nav-drawer" aria-hidden={!menuOpen}>
        <nav className="nd-links" aria-label="移动端导航">
          {NAV.links.map((link, i) => (
            <div className="nd-mask" key={link.href}>
              <a
                href={link.href}
                className="nd-link"
                onClick={(e) => handleDrawerLink(e, link.href)}
              >
                <span className="nd-idx">0{i + 1}</span>
                <span>{link.label}</span>
              </a>
            </div>
          ))}
        </nav>
        <div className="nd-foot">
          LOCAL — <em>{clock}</em>
        </div>
      </div>
    </>
  );
}
