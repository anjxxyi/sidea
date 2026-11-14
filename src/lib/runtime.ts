/**
 * Mutable, non-React state read inside the animation loop.
 * Preferences mirror into it so frame callbacks never need to re-subscribe.
 */
export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'kr';

// preferences.js restores these attributes before this module is loaded.
const root = typeof document !== 'undefined' ? document.documentElement : undefined;

export const runtime = {
  theme: (root?.dataset.theme === 'dark' ? 'dark' : 'light') as Theme,
  lang: (root?.lang === 'ko' ? 'kr' : 'en') as Lang,
  motion: true,
  touch: typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches,
};

export const otherTheme = (t: Theme): Theme => (t === 'dark' ? 'light' : 'dark');
