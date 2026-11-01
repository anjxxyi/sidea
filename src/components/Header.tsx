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
          className={styles.seg}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
        >
          ◐
        </button>
        <button className={seg(motion)} aria-pressed={motion} onClick={toggleMotion}>
          Motion
        </button>
      </nav>
    </header>
  );
}
