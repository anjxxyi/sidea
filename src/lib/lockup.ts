import { clamp, lerp } from './math';
import {
  A_GAP,
  BRACKET_X,
  BRACKET_Y,
  lettering as L,
  morph,
  wordSpan,
  type BracketWord,
} from './lettering';

/**
 * State of one lockup. Every field is 0..1 except `g` (current inner width).
 * p  — weight transfer, 0 = s emphasised (master), 1 = a emphasised (bracket lockup)
 * o  — bracket openness
 * g  — width between the brackets
 * wt — progress of the word swap from `prev` to `cur`
 */
export type LockupState = {
  p: number;
  o: number;
  g: number;
  cur: BracketWord | null;
  prev: BracketWord | null;
  wt: number;
  dy: number;
};

export const createLockupState = (init: Partial<LockupState> = {}): LockupState => ({
  p: 0,
  o: 0,
  g: 0,
  cur: null,
  prev: null,
  wt: 1,
  dy: 12,
  ...init,
});

export const openState = (w: BracketWord): LockupState =>
  createLockupState({ p: 1, o: 1, g: wordSpan(w), cur: w, wt: 1 });

const NS = 'http://www.w3.org/2000/svg';

/**
 * Builds the lockup inside an <svg> once and returns a cheap `render(state)`.
 * Colors come from CSS variables so a theme change needs no re-render.
 */
export function createLockup(svg: SVGSVGElement, words: BracketWord[], { center = false } = {}) {
  const g = document.createElementNS(NS, 'g');
  svg.appendChild(g);
  const path = (attrs: Record<string, string>, parent: Element = g) => {
    const el = document.createElementNS(NS, 'path');
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };

  const s = path({});
  const a = path({});
  const idea = (['i', 'd', 'e'] as const).map((k) => ({
    k,
    el: path({ d: L.static[k].d, style: 'fill:var(--fg)' }),
  }));
  const open = path({ d: L.static['('].d, style: 'fill:var(--pt)' });
  const close = path({ d: L.static[')'].d, style: 'fill:var(--pt)' });
  const wordEls = new Map<BracketWord, SVGGElement>();
  for (const w of words) {
    const wg = document.createElementNS(NS, 'g');
    wg.setAttribute('style', 'fill:var(--pt)');
    g.appendChild(wg);
    for (const p of L.W[w].parts)
      path({ d: p.d, transform: p.font ? '' : `translate(${p.x} ${p.y})` }, wg);
    wordEls.set(w, wg);
  }

  // Anchors used when centring: the rest wordmark, and the widest open lockup.
  const aRest = morph(L.aA, L.aB, 0, 0).xmax;
  const aOpen = morph(L.aA, L.aB, 1, L.delta).xmax;
  const maxSpan = Math.max(...words.map(wordSpan));

  function render(st: LockupState) {
    const o = Math.max(0, st.o);
    const dx = L.delta * st.p;
    const sm = morph(L.sA, L.sB, st.p, 0);
    const am = morph(L.aA, L.aB, st.p, dx);
    const bl = am.xmax + A_GAP * o;
    const cX = bl + st.g;

    let cx = 0;
    if (center) {
      const rest = -(0.64 + aRest + (aOpen - aRest) * st.p) / 2;
      const opened = -(0.64 + aOpen + A_GAP + maxSpan + L.brW[1]) / 2;
      cx = lerp(rest, opened, clamp(o));
    }
    g.setAttribute('transform', `translate(${cx.toFixed(2)} 0)`);

    const pc = Math.round(st.p * 100);
    s.setAttribute('d', sm.d);
    s.setAttribute('style', `fill:color-mix(in srgb,var(--pt) ${100 - pc}%,var(--fg))`);
    a.setAttribute('d', am.d);
    a.setAttribute('style', `fill:color-mix(in srgb,var(--pt) ${pc}%,var(--fg))`);
    for (const { k, el } of idea)
      el.setAttribute(
        'transform',
        `translate(${(L.static[k].x + dx).toFixed(2)} ${L.static[k].y})`,
      );

    const op = String(Math.min(1, o * 1.6));
    const sx = Math.max(1e-4, o);
    open.setAttribute('transform', `translate(${bl.toFixed(2)} ${BRACKET_Y}) scale(${sx} 1)`);
    open.setAttribute('opacity', op);
    close.setAttribute('transform', `translate(${cX.toFixed(2)} ${BRACKET_Y}) scale(${sx} 1)`);
    close.setAttribute('opacity', op);

    for (const [w, el] of wordEls) {
      let alpha = 0;
      let dy = 0;
      if (w === st.cur) {
        alpha = st.wt;
        dy = (1 - st.wt) * st.dy;
      } else if (w === st.prev) {
        alpha = 1 - st.wt;
        dy = -st.wt * st.dy;
      }
      el.setAttribute('opacity', (alpha * Math.min(1, o * 1.4)).toFixed(3));
      el.setAttribute('transform', `translate(${(bl - BRACKET_X).toFixed(2)} ${dy.toFixed(2)})`);
    }
  }

  return { render, destroy: () => g.remove() };
}
