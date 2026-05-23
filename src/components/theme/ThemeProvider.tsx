'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'warm' | 'light' | 'dark';

const KEY = 'bb_theme';

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

function applyToHtml(theme: Theme) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.classList.remove('theme-warm', 'theme-light', 'theme-dark');
  el.classList.add(`theme-${theme}`);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('warm');

  // Sync from localStorage on mount. The inline ThemeScript already applied
  // the right class before paint; this just keeps React state in line.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as Theme | null;
      if (stored === 'warm' || stored === 'light' || stored === 'dark') {
        setThemeState(stored);
        applyToHtml(stored);
      }
    } catch {
      /* localStorage blocked */
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyToHtml(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error('useTheme must be used within ThemeProvider');
  return c;
}
