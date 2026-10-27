const GLYPHS = { latin: 'abcdefghijklmnopqrstuvwxyz', hangul: '가나다라마바사아자차카타파하' };

/** Briefly shuffles characters before settling on `to`. Returns a cancel function. */
export function scramble(el: HTMLElement, to: string, duration = 520) {
  const length = Math.max(el.textContent?.length ?? 0, to.length);
  const set = /[가-힣]/.test(to) ? GLYPHS.hangul : GLYPHS.latin;
  const t0 = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / duration);
    let out = '';
    for (let i = 0; i < length; i++) {
      if (i / length < k) out += to[i] ?? '';
      else out += to[i] === ' ' ? ' ' : set[(Math.random() * set.length) | 0];
    }
    el.textContent = out;
    if (k < 1) raf = requestAnimationFrame(step);
    else el.textContent = to;
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
