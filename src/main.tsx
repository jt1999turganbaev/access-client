import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { registerSW } from 'virtual:pwa-register';

import App from './App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';

import './global.css';

// PWA: yangi versiya chiqsa, planshet o'zi yangilaydi
registerSW({ immediate: true });

const container = document.getElementById('root');
if (!container) throw new Error('#root topilmadi');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
