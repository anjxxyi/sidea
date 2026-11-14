import type { Lang, Theme } from './runtime';

/** Storage is optional: changing preferences must work even when writes are blocked. */
export function savePreference(key: 'theme', value: Theme): void;
export function savePreference(key: 'lang', value: Lang): void;
export function savePreference(key: 'theme' | 'lang', value: Theme | Lang) {
  try {
    localStorage.setItem(`sidea.${key}.v1`, value);
  } catch {
    // Keep the current session usable when storage is unavailable or full.
  }
}
