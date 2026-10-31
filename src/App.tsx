import { useEffect } from 'react';
import { PrefsProvider } from '@/context/PrefsContext';
import { FramePriority, subscribeFrame } from '@/lib/frameLoop';
import { updateLens } from '@/lib/lens';
import { initPointer } from '@/lib/pointer';
import { Hero } from '@/sections/Hero';

export function App() {
  useEffect(() => {
    initPointer();
    return subscribeFrame(updateLens, FramePriority.input);
  }, []);

  return (
    <PrefsProvider>
      <main>
        <Hero />
      </main>
    </PrefsProvider>
  );
}
