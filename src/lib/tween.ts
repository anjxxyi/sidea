import { subscribeFrame, FramePriority } from './frameLoop';
import { clamp, easeInOut, lerp } from './math';

type Tween<T> = {
  obj: T;
  key: keyof T;
  from: number;
  to: number;
  dur: number;
  fn: (t: number) => number;
  t0: number;
};

const active = new Set<Tween<Record<string, unknown>>>();
let unsubscribe: (() => void) | null = null;

function step(now: number) {
  for (const tw of [...active]) {
    const k = clamp((now - tw.t0) / tw.dur);
    (tw.obj as Record<string, number>)[tw.key as string] = lerp(tw.from, tw.to, tw.fn(k));
    if (k >= 1) active.delete(tw);
  }
  if (!active.size && unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

/** Animate a numeric field on a plain object. A new tween on the same field replaces the old one. */
export function tween<T extends object>(
  obj: T,
  key: keyof T,
  to: number,
  dur: number,
  fn = easeInOut,
) {
  for (const tw of active) if (tw.obj === obj && tw.key === key) active.delete(tw);
  active.add({
    obj,
    key,
    from: obj[key] as number,
    to,
    dur: Math.max(1, dur),
    fn,
    t0: performance.now(),
  } as never);
  if (!unsubscribe) unsubscribe = subscribeFrame(step, FramePriority.tween);
}
