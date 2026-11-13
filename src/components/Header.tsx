import { useEffect, useState } from 'react';
import { usePrefs } from '@/context/PrefsContext';
import { Symbol } from './Symbol';
import styles from './Header.module.css';

export function Header() {
  const { lang, setLang, theme, toggleTheme, motion, toggleMotion } = usePrefs();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(scrollY > 24);
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  const seg = (on: boolean) => `${styles.seg} ${on ? styles.on : ''}`;

  return (
    <header className={styles.header} data-compact={compact}>
      <nav className={styles.pill} aria-label="Site">
        <a className={`${styles.seg} ${styles.brand}`} href="#top" aria-label="sidea — back to top">
          <Symbol className={styles.symbol} />
        </a>
        <button
          className={seg(lang === 'en')}
          aria-pressed={lang === 'en'}
          onClick={() => setLang('en')}
        >
          EN
        </button>
        <button
          className={seg(lang === 'kr')}
          aria-pressed={lang === 'kr'}
          onClick={() => setLang('kr')}
        >
          KR
        </button>
        <button
          className={`${styles.seg} ${styles.icon}`}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light' : 'Dark'}
          onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
        >
          <ThemeIcon />
        </button>
        <button
          className={`${styles.seg} ${styles.icon}`}
          aria-label="Motion"
          aria-pressed={motion}
          title={motion ? 'Motion on' : 'Motion off'}
          onClick={toggleMotion}
        >
          <MotionIcon on={motion} />
        </button>
      </nav>
    </header>
  );
}

/** Half-filled circle: the two themes, side by side. */
function ThemeIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" />
    </svg>
  );
}

/** A dot with trailing lines; the lines drop away when motion is off. */
function MotionIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="11" cy="8" r="3" fill="currentColor" />
      <path
        d="M1.5 5.5h4M1 8h4.5M1.5 10.5h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{ opacity: on ? 1 : 0, transition: 'opacity .25s' }}
      />
    </svg>
  );
}
