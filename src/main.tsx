import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import './output.css';
import App from './App.tsx';
import { initSentry } from './utils/sentry';

// Initialize Sentry only in production
if (import.meta.env.PROD) {
  initSentry();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
