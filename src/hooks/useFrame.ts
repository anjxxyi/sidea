import { useEffect, useRef } from 'react';
import { subscribeFrame, type FrameCallback } from '@/lib/frameLoop';

/** Runs `cb` on every animation frame while the component is mounted. */
export function useFrame(cb: FrameCallback, priority = 0) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => subscribeFrame((now, dt) => ref.current(now, dt), priority), [priority]);
}
