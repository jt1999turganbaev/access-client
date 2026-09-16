import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Dev proxy manzili. Brauzerga chiqmaydi (VITE_ prefiksi yo'q).
  const backend = env.BACKEND_PROXY_TARGET || env.VITE_BACKEND_ORIGIN || 'http://192.168.1.250:8000';

  const proxyOptions = {
    target: backend,
    changeOrigin: true,
    secure: false,
    // ngrok free brauzer ogohlantirish sahifasini (HTML) chetlab o'tish uchun
    headers: { 'ngrok-skip-browser-warning': 'true' },
  };

  return {
    plugins: [
      react(),
      VitePWA({
        // Yangi versiya chiqsa planshet o'zi yangilaydi
        registerType: 'autoUpdate',
        includeAssets: ['background.jpg', 'uzinfocom-logo.svg', 'tmbm-logo.png', 'icons/apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Tibbiyot va farmatsevtika xodimlarining malakasini baholash markazi',
          short_name: 'TMBM',
          description: 'Planshet uchun kirishni nazorat qilish ekrani',
          lang: 'uz',
          start_url: '/',
          scope: '/',
          dir: 'ltr',
          display: 'fullscreen',
          display_override: ['fullscreen', 'standalone'],
          // Tik (portrait) va yotiq (landscape) holatlarning ikkalasi ham
          orientation: 'any',
          background_color: '#eaf2fe',
          theme_color: '#17398a',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff,woff2}'],
          // Fon rasmi kattaroq — precache chegarasini ko'taramiz
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          // Backend so'rovlari va SSE oqimi hech qachon keshlanmaydi
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkOnly',
            },
          ],
          cleanupOutdatedCaches: true,
        },
        // Dev serverda ham (npm run dev:3000) manifest va service worker beriladi —
        // planshetda "Ilovani o'rnatish" chiqishi uchun
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
          navigateFallbackAllowlist: [/^\/(?!api\/|media\/|static\/).*/],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // access'dagidek: katta kutubxonalar alohida chunk'larda
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            mantine: ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/notifications'],
            icons: ['@tabler/icons-react'],
          },
        },
      },
    },
    server: {
      port: 5173,
      // Backendda CORS yo'q — dev'da /api (SSE ham) va rasmlar proxy orqali ketadi
      proxy: {
        '/api': proxyOptions,
        '/media': proxyOptions,
        '/static': proxyOptions,
      },
    },
  };
});
