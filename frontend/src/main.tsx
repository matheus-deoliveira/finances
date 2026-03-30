import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/global.css';
import './shared/i18n/config'; // Import i18n configuration
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
