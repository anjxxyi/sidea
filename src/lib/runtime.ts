/**
 * Mutable, non-React state read inside the animation loop.
 * Preferences mirror into it so frame callbacks never need to re-subscribe.
 */
export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'kr';

export const runtime = {
  theme: 'dark' as Theme,
  lang: 'en' as Lang,
  motion: true,
  touch: typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches,
};

export const otherTheme = (t: Theme): Theme => (t === 'dark' ? 'light' : 'dark');
