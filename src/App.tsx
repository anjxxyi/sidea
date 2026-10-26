import { PrefsProvider } from '@/context/PrefsContext';

export function App() {
  return (
    <PrefsProvider>
      <main />
    </PrefsProvider>
  );
}
