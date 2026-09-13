import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

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
  }, []);

  const setTheme = useCallback((next: Theme, animate = false) => {
    requested.current = next;
    const currentRevision = ++revision.current;
    const root = document.documentElement;
    const interrupted = active.current !== null;
    active.current?.skipTransition();
    active.current = null;
    root.classList.remove('theme-transitioning');

    const commit = () => {
      if (revision.current !== currentRevision) return;
      applyTheme(next);
      flushSync(() => setThemeState(next));
    };

    // Repeated input settles immediately; a stale snapshot must never win.
    if (!animate || interrupted || typeof document.startViewTransition !== 'function'
      || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commit();
      return;
    }

    root.classList.add('theme-transitioning');
    try {
      const transition = document.startViewTransition(commit);
      active.current = transition;
      const cleanup = () => {
        if (active.current !== transition) return;
        active.current = null;
        root.classList.remove('theme-transitioning');
      };
      void transition.ready.catch(() => undefined);
      void transition.finished.then(cleanup, cleanup);
    } catch {
      root.classList.remove('theme-transitioning');
      commit();
    }
  }, []);

  const toggleTheme = useCallback((animate = true) => {
    setTheme(requested.current === 'dark' ? 'light' : 'dark', animate);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
