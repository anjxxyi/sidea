import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { PrefsProvider } from '@/context/PrefsContext';
import { ToastProvider } from '@/context/ToastContext';
import { FramePriority, subscribeFrame } from '@/lib/frameLoop';
import { updateLens } from '@/lib/lens';
import { initPointer } from '@/lib/pointer';
import { Footer } from '@/sections/Footer';
import { Hero } from '@/sections/Hero';
import { Now } from '@/sections/Now';
import { Programs } from '@/sections/Programs';
import { Statement } from '@/sections/Statement';

export function App() {
  useEffect(() => {
    initPointer();
    return subscribeFrame(updateLens, FramePriority.input);
  }, []);

  return (
    <PrefsProvider>
      <ToastProvider>
        <Header />
        <main>
          <Hero />
          <Statement />
          <Programs />
          <Now />
        </main>
        <Footer />
      </ToastProvider>
    </PrefsProvider>
  );
}
