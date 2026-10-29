import { lerp } from './math';
import { runtime } from './runtime';

/** Shared pointer state. `lx/ly` is the eased position the lens follows. */
export const pointer = {
  x: -999,
  y: -999,
  lx: -999,
  ly: -999,
  inside: false,
  down: false,
  touchLens: false,
};

let started = false;

export function initPointer() {
  if (started) return;
  started = true;
  let holdTimer = 0;
  let holdAt: [number, number] | null = null;

  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') {
      if (pointer.touchLens) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      } else if (holdAt && Math.hypot(e.clientX - holdAt[0], e.clientY - holdAt[1]) > 10) {
        clearTimeout(holdTimer);
      }
      return;
    }
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointer.inside) {
      pointer.lx = pointer.x;
      pointer.ly = pointer.y;
    }
    pointer.inside = true;
  });

  document.documentElement.addEventListener('pointerleave', () => (pointer.inside = false));

  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      holdAt = [e.clientX, e.clientY];
      clearTimeout(holdTimer);
      // Long-press anywhere to peek through the lens on touch screens.
      holdTimer = window.setTimeout(() => {
        if (!holdAt) return;
        pointer.x = pointer.lx = holdAt[0];
        pointer.y = pointer.ly = holdAt[1];
        pointer.inside = pointer.touchLens = true;
      }, 320);
      return;
    }
    if (!(e.target as Element).closest('button, a, [data-interactive]')) pointer.down = true;
  });

  const endTouch = () => {
    clearTimeout(holdTimer);
    holdAt = null;
    if (pointer.touchLens) pointer.touchLens = pointer.inside = false;
  };
  addEventListener('pointerup', (e) => {
    pointer.down = false;
    if (e.pointerType === 'touch') endTouch();
  });
  addEventListener('pointercancel', endTouch);
}

export function easePointer() {
  const k = runtime.motion ? 0.2 : 1;
  pointer.lx = lerp(pointer.lx, pointer.x, k);
  pointer.ly = lerp(pointer.ly, pointer.y, k);
}
