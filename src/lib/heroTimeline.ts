import { lerp, easeOutBack, segment } from './math';
import { wordSpan, type BracketWord } from './lettering';
import type { LockupState } from './lockup';

/** The hero loop: rest → weight moves s→a → brackets open → words cycle → close → back. */
export const HERO_WORDS: BracketWord[] = ['fter', 'ngle', 'rchive', 'rtifact', 'bout', 'board'];

const T = { rest: 1700, transfer: 900, open: 850, hold: 1250, swap: 720, close: 850 };
const OPEN_AT = T.rest + T.transfer * 0.55;
const FIRST_SWAP = OPEN_AT + T.open + T.hold;
const STEP = T.swap + T.hold;
const CLOSE_AT = FIRST_SWAP + (HERO_WORDS.length - 1) * STEP;
const RETURN_AT = CLOSE_AT + T.close * 0.45;
export const HERO_PERIOD = RETURN_AT + T.transfer;

/** Writes the hero state for time `t` (ms, wrapped by the caller). Pure: same t, same frame. */
export function heroStateAt(st: LockupState, t: number) {
  const words = HERO_WORDS;
  st.p = t < RETURN_AT ? segment(t, T.rest, T.transfer) : 1 - segment(t, RETURN_AT, T.transfer);
  st.o =
    t < CLOSE_AT ? segment(t, OPEN_AT, T.open, easeOutBack) : 1 - segment(t, CLOSE_AT, T.close);

  if (t < OPEN_AT) {
    Object.assign(st, { cur: words[0], prev: null, wt: 0, g: 0 });
  } else if (t < FIRST_SWAP) {
    st.cur = words[0];
    st.prev = null;
    st.wt = segment(t, OPEN_AT, T.open);
    st.g = lerp(0, wordSpan(words[0]), segment(t, OPEN_AT, T.open, easeOutBack));
  } else if (t < CLOSE_AT) {
    const i = Math.min(words.length - 1, Math.floor((t - FIRST_SWAP) / STEP) + 1);
    const start = FIRST_SWAP + (i - 1) * STEP;
    st.cur = words[i];
    st.prev = words[i - 1];
    st.wt = segment(t, start, T.swap);
    st.g = lerp(wordSpan(words[i - 1]), wordSpan(words[i]), segment(t, start, T.swap, easeOutBack));
  } else {
    const lastWord = words[words.length - 1];
    st.cur = null;
    st.prev = lastWord;
    st.wt = segment(t, CLOSE_AT, T.close * 0.6);
    st.g = lerp(wordSpan(lastWord), 0, segment(t, CLOSE_AT, T.close));
  }
}
