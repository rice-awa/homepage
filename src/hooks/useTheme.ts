import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function readTheme(): Theme {
  if (typeof document !== 'undefined') {
    const fromDom = document.documentElement.dataset.theme;
    if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  }
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
