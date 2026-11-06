import { useEffect, useRef, useState } from 'react';
import { copy, programs } from '@/content/copy';
import { LensHost, type Layer } from '@/components/LensHost';
import { Lockup } from '@/components/Lockup';
import { Text } from '@/components/Text';
import { useFrame } from '@/hooks/useFrame';
import { useViewport } from '@/hooks/useViewport';
import { lettering as L, wordSpan } from '@/lib/lettering';
import { createLockupState } from '@/lib/lockup';
import { clamp, easeInOut, lerp } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import styles from './Programs.module.css';

/** Lockup widths in lettering units (the viewBox is 104 units tall). */
const UNITS = programs.map(({ word }) => L.W[word].close + 20);

/**
 * Programs as a horizontal pass: vertical scroll moves the lockups sideways,
 * holding at each one while its brackets open.
 */
export function Programs() {
  const section = useRef<HTMLElement>(null);
  const states = useRef(
    programs.map(({ word }) => ({ current: createLockupState({ cur: word, dy: 0 }) })),
  );
  const items = useRef<Record<Layer, (HTMLDivElement | null)[]>>({ base: [], lens: [] });
  const metas = useRef<Record<Layer, (HTMLDivElement | null)[]>>({ base: [], lens: [] });
  const [counter, setCounter] = useState(1);
  const { w: vw, h: vh } = useViewport();

  // Size the lockups so an open one fits the screen width.
  const height = Math.min(vh * 0.42, (vw * (vw < 760 ? 0.92 : 0.84) * 104) / Math.max(...UNITS));
  const gap = height * 1.1;
  const layout = useRef<{ x: number; mid: number }[]>([]);
  useEffect(() => {
    let x = 0;
    layout.current = UNITS.map((u) => {
      const w = (height * u) / 104;
      const item = { x, mid: w / 2 };
      x += w + gap;
      return item;
    });
  }, [height, gap]);

  useFrame(() => {
    const el = section.current;
    const geo = layout.current;
    if (!el || !geo.length) return;
    const r = el.getBoundingClientRect();
    const vw = innerWidth;
    const vh = innerHeight;
    if (r.top > vh || r.bottom < 0) return;
    const progress = clamp(-r.top / (r.height - vh));

    // Keyframes: enter → hold at each lockup → exit. Holds weigh a little more than travel.
    const stop = (i: number) => vw / 2 - (geo[i].x + geo[i].mid);
    const keys = [
      stop(0) + vw * 0.75,
      ...geo.flatMap((_, i) => [stop(i), stop(i)]),
      stop(geo.length - 1) - vw * 0.75,
    ];
    const weights = keys.slice(1).map((k, i) => (k === keys[i] ? 1.1 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    let tx = keys[keys.length - 1];
    for (let i = 0; i < weights.length; i++) {
      const w = weights[i] / total;
      if (progress <= acc + w || i === weights.length - 1) {
        tx = lerp(keys[i], keys[i + 1], easeInOut(clamp((progress - acc) / w)));
        break;
      }
      acc += w;
    }

    let nearest = 0;
    let best = Infinity;
    geo.forEach((g, i) => {
      const t = Math.abs(tx + g.x + g.mid - vw / 2) / (vw / 2);
      const a = runtime.motion ? easeInOut(clamp((0.62 - t) / 0.42)) : 1;
      Object.assign(states.current[i].current, {
        p: a,
        o: a,
        wt: a,
        g: wordSpan(programs[i].word) * a,
      });
      if (t < best) {
        best = t;
        nearest = i;
      }
      for (const layer of ['base', 'lens'] as const) {
        const item = items.current[layer][i];
        const meta = metas.current[layer][i];
        if (item) item.style.transform = `translate(${(tx + g.x).toFixed(1)}px, -50%)`;
        if (meta) {
          meta.style.opacity = a.toFixed(3);
          meta.style.transform = `translateY(${((1 - a) * 10).toFixed(1)}px)`;
        }
      }
    });
    setCounter((c) => (c === nearest + 1 ? c : nearest + 1));
  });

  return (
    <section ref={section} className={styles.programs} aria-labelledby="programs-title">
      <div className={styles.sticky}>
        <LensHost className={styles.fill}>
          {(layer) => (
            <div className={styles.inner} style={{ '--h': `${height}px` } as React.CSSProperties}>
              <div className={styles.head}>
                <Text copy={copy.programsLabel} className="label eyebrow" />
                <h2 id={layer === 'base' ? 'programs-title' : undefined} className="h2">
                  <Text copy={copy.programsTitle} />
                </h2>
              </div>
              {programs.map(({ word, text }, i) => (
                <div
                  key={word}
                  className={styles.item}
                  ref={(el) => (items.current[layer][i] = el)}
                >
                  <Lockup
                    words={[word]}
                    state={states.current[i]}
                    viewBox={`0 20 ${UNITS[i].toFixed(0)} 104`}
                    label={`sidea(${word})`}
                    className={styles.mark}
                  />
                  <div className={styles.meta} ref={(el) => (metas.current[layer][i] = el)}>
                    <Text copy={text} className={styles.desc} />
                    <Text copy={copy.soon} className={`label ${styles.soon}`} />
                  </div>
                </div>
              ))}
              <span className={`label ${styles.count}`}>{`0${counter} / 0${programs.length}`}</span>
            </div>
          )}
        </LensHost>
      </div>
    </section>
  );
}
