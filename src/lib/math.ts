export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

/** Cubic in-out — the default curve for weight and position changes. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Slight overshoot — used when brackets open or resize. */
export const easeOutBack = (t: number) => {
  const c1 = 1.45;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Progress of `t` through the window [start, start + duration], shaped by `fn`. */
export const segment = (t: number, start: number, duration: number, fn = easeInOut) =>
  t <= start ? 0 : t >= start + duration ? 1 : fn((t - start) / duration);
