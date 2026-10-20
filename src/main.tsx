import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const root = document.getElementById('root')!;
// index.html ships crawlable fallback markup; React replaces it on mount.
root.replaceChildren();
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
