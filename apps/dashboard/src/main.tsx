import { palette } from '@e-alert/shared';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App';
import './styles.css';

/** One source of truth: shared palette → CSS variables, light and dark. */
function injectTokens() {
  const vars = (p: Record<string, string>) => Object.entries(p).map(([k, v]) => `--${k}:${v};`).join('');
  const extra = {
    light: '--glass:rgba(250,249,247,0.72);--glassEdge:rgba(255,255,255,0.8);--glassHighlight:rgba(255,255,255,0.7);',
    dark: '--glass:rgba(36,36,38,0.66);--glassEdge:rgba(255,255,255,0.12);--glassHighlight:rgba(255,255,255,0.08);',
  };
  const css = `:root{${vars(palette.light)}${extra.light}color-scheme:light}
@media (prefers-color-scheme: dark){:root{${vars(palette.dark)}${extra.dark}color-scheme:dark}}`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.prepend(el);
}
injectTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
