import { useRef, type ReactNode } from 'react';
import { FramePriority } from '@/lib/frameLoop';
import { lens } from '@/lib/lens';
import { pointer } from '@/lib/pointer';
import { otherTheme, type Theme } from '@/lib/runtime';
import { usePrefs } from '@/context/PrefsContext';
import { useFrame } from '@/hooks/useFrame';
import styles from './LensHost.module.css';

export type Layer = 'base' | 'lens';

type LensHostProps = {
  /** Renders the section twice: once normally, once for the "other side" lens. */
  children: (layer: Layer) => ReactNode;
  className?: string;
  /** Theme of the base layer. Defaults to the site theme. */
  baseTheme?: Theme;
};

/**
 * Every section is a lens host. The lens is one circle in viewport space,
 * clipped into each host, so it stays whole across section boundaries.
 */
export function LensHost({ children, className, baseTheme }: LensHostProps) {
  const { theme } = usePrefs();
  const host = useRef<HTMLDivElement>(null);
  const lensLayer = useRef<HTMLDivElement>(null);
  const base = baseTheme ?? theme;

  useFrame(() => {
    const el = host.current;
    const layer = lensLayer.current;
    if (!el || !layer) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    layer.style.setProperty('--r', `${lens.r.toFixed(1)}px`);
    layer.style.setProperty('--x', `${(pointer.lx - r.left).toFixed(1)}px`);
    layer.style.setProperty('--y', `${(pointer.ly - r.top).toFixed(1)}px`);
  }, FramePriority.render);

  return (
    <div ref={host} className={`${styles.host} ${className ?? ''}`}>
      <div className={styles.layer} data-theme={baseTheme}>
        {children('base')}
      </div>
      <div
        ref={lensLayer}
        className={`${styles.layer} ${styles.lens}`}
        data-theme={otherTheme(base)}
        aria-hidden="true"
      >
        {children('lens')}
      </div>
    </div>
  );
}
