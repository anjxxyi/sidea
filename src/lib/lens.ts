import { lerp } from './math';
import { easePointer, pointer } from './pointer';
import { runtime } from './runtime';

/** Radius of the "other side" lens, shared by every section so the circle never breaks at edges. */
export const lens = { r: 0 };

export function updateLens() {
  easePointer();
  const on = runtime.motion && pointer.inside && (!runtime.touch || pointer.touchLens);
  const full = Math.hypot(innerWidth, innerHeight);
  const target = on ? (pointer.down ? full : pointer.touchLens ? 110 : 130) : 0;
  lens.r = lerp(lens.r, target, pointer.down ? 0.07 : 0.16);
}
