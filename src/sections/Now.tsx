import { useRef, type ReactNode } from 'react';
import { copy } from '@/content/copy';
import { LensHost, type Layer } from '@/components/LensHost';
import { Lockup } from '@/components/Lockup';
import { Text } from '@/components/Text';
import { useToast } from '@/context/ToastContext';
import { usePrefs } from '@/context/PrefsContext';
import { useFrame } from '@/hooks/useFrame';
import { lettering as L } from '@/lib/lettering';
import { openState } from '@/lib/lockup';
import { clamp, easeInOut, lerp } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import styles from './Now.module.css';

type Doc = { key: 'brief' | 'flows' | 'notes'; title: string; meta: string; body: ReactNode };

/** Planning covers that show the structure of the work, not its substance. */
const DOCS: Doc[] = [
  {
    key: 'brief',
    title: 'Brief',
    meta: 'v0.3 · draft',
    body: (
      <div className={styles.body}>
        {[
          ['01', 'Context', '02'],
          ['02', 'Problem', '04'],
          ['03', 'People', '07'],
          ['04', 'Scope', '09'],
        ].map(([n, t, p]) => (
          <div key={n} className={styles.toc}>
            <span className={styles.small}>{n}</span>
            <span className={styles.grow}>{t}</span>
            <span className={styles.small}>p.{p}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'flows',
    title: 'Flows',
    meta: '12 screens · 3 paths',
    body: (
      <svg className={styles.diagram} viewBox="0 0 240 134" aria-hidden="true">
        <rect x="8" y="14" width="54" height="30" rx="6" />
        <rect x="93" y="14" width="54" height="30" rx="6" className={styles.on} />
        <rect x="178" y="14" width="54" height="30" rx="6" />
        <rect x="93" y="90" width="54" height="30" rx="6" />
        <rect x="178" y="90" width="54" height="30" rx="6" />
        <path d="M69 29h17M154 29h17M120 51v32M154 105h17" />
        <path d="M82 25l4 4-4 4M167 25l4 4-4 4M116 79l4 4 4-4M167 101l4 4-4 4" />
      </svg>
    ),
  },
  {
    key: 'notes',
    title: 'Notes',
    meta: '4 entries · ongoing',
    body: (
      <div className={styles.body}>
        {[
          ['11.01', 'Kickoff'],
          ['11.03', 'Picked a name'],
          ['11.06', 'First flows'],
          ['11.10', 'Review'],
        ].map(([d, t]) => (
          <div key={d} className={styles.note}>
            <span className={styles.small}>{d}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    ),
  },
];

/** Docs rest in a pile and fan out as the section scrolls. */
const PILE = [
  { x: -0.04, y: 0.02, r: -5 },
  { x: 0.02, y: 0, r: 2 },
  { x: 0.06, y: 0.03, r: 7 },
];
const FAN = [
  { x: -1.05, y: 0.04, r: -9 },
  { x: 0, y: -0.05, r: 1 },
  { x: 1.05, y: 0.06, r: 9 },
];

const LOCK_W = (L.W.rtifact.close + 20 + L.delta).toFixed(0);

export function Now() {
  const section = useRef<HTMLElement>(null);
  const lockState = useRef(openState('rtifact'));
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<Record<Layer, (HTMLElement | null)[]>>({ base: [], lens: [] });
  const hover = useRef([0, 0, 0]);
  const target = useRef([0, 0, 0]);
  const toast = useToast();
  const { lang } = usePrefs();

  useFrame(() => {
    const el = section.current;
    if (!el || !stage.current) return;
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    if (r.top > vh || r.bottom < 0) return;
    const np = runtime.motion ? easeInOut(clamp((-r.top / (r.height - vh)) * 1.4 - 0.1)) : 1;
    // Fan out, but keep the outer (rotated) cards inside the stage.
    const stageW = stage.current.clientWidth;
    const cardW = cards.current.base[0]?.offsetWidth ?? 0;
    const maxSpread = (stageW / 2 - 8 - cardW * 0.6) / 1.05;
    const spread = Math.max(0, Math.min(stageW * (innerWidth < 760 ? 0.27 : 0.32), maxSpread));

    for (let i = 0; i < DOCS.length; i++) {
      const h = (hover.current[i] = lerp(
        hover.current[i],
        target.current[i],
        runtime.motion ? 0.14 : 1,
      ));
      const a = PILE[i];
      const b = FAN[i];
      const x = lerp(a.x, b.x, np) * spread;
      const y = lerp(a.y, b.y, np) * 200 - h * 18;
      const rot = lerp(a.r, b.r, np) * (1 - h * 0.35);
      const transform =
        `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(h * 40).toFixed(1)}px) ` +
        `rotate(${rot.toFixed(2)}deg) rotateX(${((1 - np) * 18).toFixed(1)}deg)`;
      const z = h > 0.5 ? '5' : i === 1 ? '3' : '2';
      for (const card of [cards.current.base[i], cards.current.lens[i]]) {
        if (!card) continue;
        card.style.transform = transform;
        card.style.zIndex = z;
      }
    }
  });

  const refuse = (i: number) => {
    for (const card of [cards.current.base[i], cards.current.lens[i]]) {
      if (!card) continue;
      card.classList.remove(styles.shake);
      void card.offsetWidth;
      card.classList.add(styles.shake);
    }
    toast(copy.notYet[lang]);
  };

  const onCardClick = (i: number) => {
    // On touch the first tap lifts the card; the second one answers.
    if (runtime.touch && target.current[i] < 1) {
      target.current.fill(0);
      target.current[i] = 1;
      return;
    }
    refuse(i);
  };

  return (
    <section ref={section} id="now" className={styles.now} aria-labelledby="now-title">
      <div className={styles.sticky}>
        <LensHost className={styles.fill}>
          {(layer) => {
            const base = layer === 'base';
            return (
              <div className={styles.grid}>
                <div className={styles.copy}>
                  <Text copy={copy.nowLabel} className="label eyebrow" />
                  <Lockup
                    words={['rtifact']}
                    state={lockState}
                    viewBox={`0 20 ${LOCK_W} 104`}
                    label="sidea(rtifact)"
                    className={styles.lock}
                  />
                  <h3 id={base ? 'now-title' : undefined} className={styles.title}>
                    <Text copy={copy.nowTitle} />
                  </h3>
                  <div className={styles.status}>
                    <span className={styles.dot} aria-hidden="true" />
                    <Text copy={copy.nowStatus} className="label" />
                  </div>
                  <Text copy={copy.nowLede} as="p" className={styles.lede} />
                </div>
                <div className={styles.stage} ref={base ? stage : undefined}>
                  {DOCS.map((doc, i) => (
                    <article
                      key={doc.key}
                      ref={(el) => (cards.current[layer][i] = el)}
                      className={`${styles.doc} ${styles[doc.key]}`}
                      aria-label={base ? `Project 01 — ${doc.title}` : undefined}
                      tabIndex={base ? 0 : -1}
                      data-interactive
                      onPointerEnter={(e) => e.pointerType !== 'touch' && (target.current[i] = 1)}
                      onPointerLeave={(e) => e.pointerType !== 'touch' && (target.current[i] = 0)}
                      onClick={() => onCardClick(i)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        refuse(i);
                      }}
                    >
                      <div className={`${styles.top} ${styles.small}`}>
                        <span>Project 01</span>
                        <span>{`0${i + 1} / 0${DOCS.length}`}</span>
                      </div>
                      {doc.body}
                      <div>
                        <h4 className={styles.docTitle}>{doc.title}</h4>
                        <p className={`${styles.small} ${styles.ver}`}>{doc.meta}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          }}
        </LensHost>
      </div>
    </section>
  );
}
