// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: 'cloudflare',

    // Disable the workerd dev-inspector during build. It binds a fixed port
    // (default 9229) via @cloudflare/vite-plugin; when Turbo builds multiple
    // Cloudflare apps in parallel they race on that port and one fails with
    // EADDRINUSE. The inspector is a debugging-only feature, unused in CI.
    inspectorPort: false,
  }),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['msw', 'msw/node', '@mswjs/interceptors'],
    },
  },
});
