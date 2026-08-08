import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export type ThemeToggleOrigin = {
  x: number;
  y: number;
};

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

function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function prefersCoarsePointer() {
  return typeof matchMedia === 'function'
    && matchMedia('(hover: none), (pointer: coarse)').matches;
}

function supportsViewTransition() {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/** 从点击点到覆盖整个视口所需的最大圆半径 */
function maxRadiusFrom(x: number, y: number) {
  const { innerWidth: w, innerHeight: h } = window;
  const dist = (cx: number, cy: number) => Math.hypot(cx - x, cy - y);
  return Math.max(dist(0, 0), dist(w, 0), dist(0, h), dist(w, h));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback((origin?: ThemeToggleOrigin) => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';

    const commit = () => {
      // 视觉主题靠 data-theme CSS 变量，必须在 VT 回调内同步写入 DOM
      applyTheme(next);
      setThemeState(next);
    };

    // 无 VT / 偏好减少动效：直接切换（body 自带 color/background 过渡）
    if (!supportsViewTransition() || prefersReducedMotion() || prefersCoarsePointer()) {
      commit();
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const r = maxRadiusFrom(x, y);

    const root = document.documentElement;
    root.style.setProperty('--theme-x', `${x}px`);
    root.style.setProperty('--theme-y', `${y}px`);
    root.style.setProperty('--theme-r', `${r}px`);
    root.classList.add('theme-transitioning');

    const transition = document.startViewTransition(commit);

    transition.finished.finally(() => {
      root.classList.remove('theme-transitioning');
      root.style.removeProperty('--theme-x');
      root.style.removeProperty('--theme-y');
      root.style.removeProperty('--theme-r');
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
