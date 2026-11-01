import { useRef } from 'react';
import { copy } from '@/content/copy';
import { LensHost, type Layer } from '@/components/LensHost';
import { Lockup } from '@/components/Lockup';
import { Text } from '@/components/Text';
import { useFrame } from '@/hooks/useFrame';
import { useViewport } from '@/hooks/useViewport';
import { HERO_PERIOD, HERO_WORDS, heroStateAt } from '@/lib/heroTimeline';
import { createLockupState, openState } from '@/lib/lockup';
import { clamp } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import styles from './Hero.module.css';

export function Hero() {
  const state = useRef(createLockupState());
  const inners = useRef<Partial<Record<Layer, HTMLDivElement | null>>>({});
  const clock = useRef(0);
  const { w } = useViewport();
  const viewBox = w < 760 ? '-228 14 456 116' : '-300 14 600 116';

  useFrame((_, dt) => {
    if (runtime.motion) {
      clock.current += dt;
      heroStateAt(state.current, clock.current % HERO_PERIOD);
    } else {
      Object.assign(state.current, openState('fter'));
    }
    // Drift up and fade as the next section arrives.
    const k = clamp(scrollY / innerHeight);
    for (const el of Object.values(inners.current)) {
      if (!el) continue;
      el.style.transform = `translateY(${k * -80}px) scale(${1 - k * 0.12})`;
      el.style.opacity = String(1 - k * 0.9);
    }
  });

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        sidea — Ideas, on the side.
      </h1>
      <LensHost className={styles.host}>
        {(layer) => (
          <div className={styles.inner} ref={(el) => (inners.current[layer] = el)}>
            <Lockup
              words={HERO_WORDS}
              state={state}
              viewBox={viewBox}
              center
              label="sidea"
              className={styles.mark}
            />
            <Text copy={copy.tagline} as="p" className={styles.tagline} />
            <Text copy={copy.scroll} className={`label ${styles.cue}`} />
          </div>
        )}
      </LensHost>
    </section>
  );
}
