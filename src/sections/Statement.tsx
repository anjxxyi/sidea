import { Fragment, useRef } from 'react';
import { copy } from '@/content/copy';
import { LensHost, type Layer } from '@/components/LensHost';
import { Text } from '@/components/Text';
import { usePrefs } from '@/context/PrefsContext';
import { useFrame } from '@/hooks/useFrame';
import { pointer } from '@/lib/pointer';
import { clamp, lerp } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import styles from './Statement.module.css';

type Char = { word: number; index: number };

/** Splits the statement into lines → words → characters (Korean stays whole per word). */
function parse(text: string, perChar: boolean) {
  const chars: Char[] = [];
  let word = 0;
  const lines = text.split('\n').map((line) =>
    line.split(' ').map((w) => {
      const units = perChar ? [...w] : [w];
      const out = units.map((u) => {
        chars.push({ word, index: chars.length });
        return { text: u, index: chars.length - 1 };
      });
      word++;
      return out;
    }),
  );
  return { lines, chars, words: word };
}

export function Statement() {
  const { lang } = usePrefs();
  const section = useRef<HTMLElement>(null);
  const refs = useRef<Record<Layer, (HTMLSpanElement | null)[]>>({ base: [], lens: [] });
  const isLatin = lang === 'en';
  const { lines, chars, words } = parse(copy.statement[lang], isLatin);

  useFrame(() => {
    const el = section.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    if (r.top > vh || r.bottom < 0) return;
    const progress = clamp(-r.top / (r.height - vh));
    const wave = progress * (chars.length + 8) - 4;

    chars.forEach((c, i) => {
      const reveal = runtime.motion ? clamp(progress * (words + 1.2) - c.word) : 1;
      let wdth = 100;
      let wght = 640;
      if (isLatin && runtime.motion) {
        let k: number;
        if (runtime.touch || !pointer.inside) {
          // No cursor: a wave of weight travels through the letters with the scroll.
          k = Math.exp(-Math.pow((i - wave) / 2.4, 2));
        } else {
          const b = refs.current.base[i]?.getBoundingClientRect();
          const d = b
            ? Math.hypot(pointer.lx - (b.left + b.width / 2), pointer.ly - (b.top + b.height / 2))
            : 1e9;
          k = Math.pow(clamp(1 - d / 260), 1.6);
        }
        wdth = lerp(100, 125, k);
        wght = lerp(640, 880, k);
      }
      for (const layer of ['base', 'lens'] as const) {
        const span = refs.current[layer][i];
        if (!span) continue;
        span.style.opacity = (0.18 + 0.82 * reveal).toFixed(3);
        if (isLatin)
          span.style.fontVariationSettings = `"wdth" ${wdth.toFixed(1)}, "wght" ${wght.toFixed(0)}`;
      }
    });
  });

  return (
    <section ref={section} className={styles.statement} aria-label="About sidea">
      <LensHost className={styles.sticky}>
          {(layer) => (
            <div className={styles.inner}>
              <Text copy={copy.aboutLabel} as="p" className="label eyebrow" />
              <p
                className={isLatin ? styles.text : styles.textKr}
                aria-label={copy.statement[lang].replace('\n', ' ')}
              >
                {lines.map((line, li) => (
                  <Fragment key={`${lang}-${li}`}>
                    {li > 0 && <br />}
                    {line.map((word, wi) => (
                      <Fragment key={wi}>
                        <span className={styles.word} aria-hidden="true">
                          {word.map((u) => (
                            <span
                              key={u.index}
                              className={styles.char}
                              ref={(el) => (refs.current[layer][u.index] = el)}
                            >
                              {u.text}
                            </span>
                          ))}
                        </span>{' '}
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </p>
            </div>
          )}
        </LensHost>
    </section>
  );
}
