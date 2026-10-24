/** One requestAnimationFrame loop for the whole page. Lower priority runs first. */
export type FrameCallback = (now: number, dt: number) => void;

const subscribers = new Map<FrameCallback, number>();
let rafId = 0;
let last = 0;

function tick(now: number) {
  const dt = Math.min(64, now - last || 16);
  last = now;
  const ordered = [...subscribers].sort((a, b) => a[1] - b[1]);
  for (const [cb] of ordered) cb(now, dt);
  rafId = requestAnimationFrame(tick);
}

export function subscribeFrame(cb: FrameCallback, priority = 0) {
  subscribers.set(cb, priority);
  if (!rafId) {
    last = performance.now();
    rafId = requestAnimationFrame(tick);
  }
  return () => {
    subscribers.delete(cb);
    if (!subscribers.size) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}

export const FramePriority = {
  input: -20,
  tween: -10,
  state: 0,
  render: 10,
} as const;
