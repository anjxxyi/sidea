import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { runtime, type Lang, type Theme } from '@/lib/runtime';
import { savePreference } from '@/lib/preferences';

type Prefs = {
  theme: Theme;
  lang: Lang;
  motion: boolean;
  setLang: (lang: Lang) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  toggleMotion: () => void;
};

const PrefsContext = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(runtime.theme);
  const [lang, setLang] = useState<Lang>(runtime.lang);
  const [motion, setMotion] = useState(
    () => !matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    runtime.theme = theme;
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#262626' : '#FBFBFB');
    savePreference('theme', theme);
  }, [theme]);
  useEffect(() => {
    runtime.lang = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'ko';
    savePreference('lang', lang);
  }, [lang]);
  useEffect(() => {
    runtime.motion = motion;
    document.body.classList.toggle('no-motion', !motion);
  }, [motion]);

  const toggleTheme = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = runtime.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      runtime.theme = next;
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    if (!document.startViewTransition || !runtime.motion || !origin) return apply();
    // Spread the new theme as a circle from where it was clicked.
    const { x, y } = origin;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          {
            duration: 750,
            easing: 'cubic-bezier(.65,0,.25,1)',
            pseudoElement: '::view-transition-new(root)',
          },
        ),
      )
      .catch(() => {});
  }, []);

  const value = useMemo<Prefs>(
    () => ({ theme, lang, motion, setLang, toggleTheme, toggleMotion: () => setMotion((m) => !m) }),
    [theme, lang, motion, toggleTheme],
  );
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside <PrefsProvider>');
  return ctx;
}
