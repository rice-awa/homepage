import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

/** Where the reveal should grow from, in viewport pixels. */
export type ThemeRevealOrigin = { x: number; y: number };

function readTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Keep the current session usable without storage.
  }
}

/** Radius that carries a circle from the origin past the farthest corner. */
function radiusToFarthestCorner(x: number, y: number) {
  const { innerWidth: w, innerHeight: h } = window;
  const to = (cx: number, cy: number) => Math.hypot(cx - x, cy - y);
  return Math.max(to(0, 0), to(w, 0), to(0, h), to(w, h));
}

function clearRevealOrigin(root: HTMLElement) {
  root.style.removeProperty('--theme-x');
  root.style.removeProperty('--theme-y');
  root.style.removeProperty('--theme-r');
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const requested = useRef(theme);
  const revision = useRef(0);
  const active = useRef<ReturnType<Document['startViewTransition']> | null>(null);

  useEffect(() => () => {
    revision.current += 1;
    active.current?.skipTransition();
    active.current = null;
    document.documentElement.classList.remove('theme-transitioning');
    clearRevealOrigin(document.documentElement);
  }, []);

  const setTheme = useCallback((next: Theme, origin?: ThemeRevealOrigin) => {
    requested.current = next;
    const currentRevision = ++revision.current;
    const root = document.documentElement;
    const interrupted = active.current !== null;
    active.current?.skipTransition();
    active.current = null;
    root.classList.remove('theme-transitioning');
    clearRevealOrigin(root);

    const commit = () => {
      if (revision.current !== currentRevision) return;
      applyTheme(next);
      flushSync(() => setThemeState(next));
    };

    // No origin means no pointer to grow from — keyboard activation and
    // repeated input settle immediately; a stale snapshot must never win.
    if (!origin || interrupted || typeof document.startViewTransition !== 'function'
      || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commit();
      return;
    }

    root.style.setProperty('--theme-x', `${origin.x}px`);
    root.style.setProperty('--theme-y', `${origin.y}px`);
    root.style.setProperty('--theme-r', `${radiusToFarthestCorner(origin.x, origin.y)}px`);
    root.classList.add('theme-transitioning');
    try {
      const transition = document.startViewTransition(commit);
      active.current = transition;
      const cleanup = () => {
        if (active.current !== transition) return;
        active.current = null;
        root.classList.remove('theme-transitioning');
        clearRevealOrigin(root);
      };
      void transition.ready.catch(() => undefined);
      void transition.finished.then(cleanup, cleanup);
    } catch {
      root.classList.remove('theme-transitioning');
      clearRevealOrigin(root);
      commit();
    }
  }, []);

  const toggleTheme = useCallback((origin?: ThemeRevealOrigin) => {
    setTheme(requested.current === 'dark' ? 'light' : 'dark', origin);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
