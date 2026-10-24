import { useEffect, useRef, type MutableRefObject } from 'react';
import { FramePriority } from '@/lib/frameLoop';
import { createLockup, type LockupState } from '@/lib/lockup';
import type { BracketWord } from '@/lib/lettering';
import { useFrame } from '@/hooks/useFrame';

type LockupProps = {
  words: BracketWord[];
  /** Shared state — the base and lens copies of a section read the same object. */
  state: MutableRefObject<LockupState>;
  viewBox: string;
  center?: boolean;
  label: string;
  className?: string;
};

/** The sidea lettering. Built once as SVG paths, then redrawn every frame from `state`. */
export function Lockup({ words, state, viewBox, center, label, className }: LockupProps) {
  const svg = useRef<SVGSVGElement>(null);
  const renderer = useRef<ReturnType<typeof createLockup> | null>(null);
  const wordsKey = words.join('|');

  useEffect(() => {
    if (!svg.current) return;
    renderer.current = createLockup(svg.current, wordsKey.split('|') as BracketWord[], { center });
    renderer.current.render(state.current);
    return () => {
      renderer.current?.destroy();
      renderer.current = null;
    };
  }, [wordsKey, center, state]);

  useFrame(() => renderer.current?.render(state.current), FramePriority.render);

  return <svg ref={svg} className={className} viewBox={viewBox} role="img" aria-label={label} />;
}
