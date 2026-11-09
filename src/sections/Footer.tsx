import { useEffect, useRef } from 'react';
import { contactEmail, copy } from '@/content/copy';
import { LensHost } from '@/components/LensHost';
import { Lockup } from '@/components/Lockup';
import { Text } from '@/components/Text';
import { usePrefs } from '@/context/PrefsContext';
import { useToast } from '@/context/ToastContext';
import { lettering as L, type BracketWord, wordSpan } from '@/lib/lettering';
import { openState } from '@/lib/lockup';
import { easeOutBack } from '@/lib/math';
import { otherTheme, runtime } from '@/lib/runtime';
import { tween } from '@/lib/tween';
import styles from './Footer.module.css';

const WORDS: BracketWord[] = ['fter', 'ngle', 'rchive', 'telier', 'rtifact', 'bout', 'board'];
const VIEW_W = (Math.max(...WORDS.map((w) => L.W[w].close)) + 20 + L.delta).toFixed(0);

/** Sits under the page and is revealed as <main> scrolls away. Always the inverted theme. */
export function Footer() {
  const { theme, lang } = usePrefs();
  const toast = useToast();
  const el = useRef<HTMLElement>(null);
  const state = useRef({ ...openState('board'), dy: 14 });
  const index = useRef(WORDS.length - 1);
  const lastInput = useRef(0);

  const show = (i: number) => {
    if (i === index.current) return;
    const st = state.current;
    Object.assign(st, { prev: WORDS[index.current], cur: WORDS[i], wt: 0 });
    tween(st, 'wt', 1, runtime.motion ? 420 : 1);
    tween(st, 'g', wordSpan(WORDS[i]), runtime.motion ? 620 : 1, easeOutBack);
    index.current = i;
  };

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    // Desktop: the word follows the pointer across the width.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = node.getBoundingClientRect();
      show(Math.min(WORDS.length - 1, Math.floor(((e.clientX - r.left) / r.width) * WORDS.length)));
      lastInput.current = performance.now();
    };
    // Touch: each tap opens the next word.
    const onClick = (e: MouseEvent) => {
      if (!runtime.touch || (e.target as Element).closest('button')) return;
      show((index.current + 1) % WORDS.length);
      lastInput.current = performance.now();
    };
    node.addEventListener('pointermove', onMove);
    node.addEventListener('click', onClick);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('click', onClick);
    };
  }, []);


  const copyMail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      toast(copy.copied[lang]);
    } catch {
      toast(contactEmail);
    }
  };

  const inverted = otherTheme(theme);

  return (
    <footer ref={el} className={styles.footer} data-theme={inverted} aria-label="Contact">
      <LensHost className={styles.fill} baseTheme={inverted}>
        {(layer) => (
          <div className={styles.inner}>
            <Lockup
              words={WORDS}
              state={state}
              viewBox={`0 20 ${VIEW_W} 104`}
              label="sidea"
              className={styles.mark}
            />
            <div className={styles.row}>
              {contactEmail && (
                <button
                  className={styles.mail}
                  onClick={copyMail}
                  tabIndex={layer === 'base' ? 0 : -1}
                  aria-label={`Copy ${contactEmail}`}
                >
                  {contactEmail}
                </button>
              )}
              <Text copy={copy.rights} className="label mute" />
            </div>
          </div>
        )}
      </LensHost>
    </footer>
  );
}
