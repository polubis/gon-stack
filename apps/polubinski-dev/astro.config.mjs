// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://polubinski.dev',

  devToolbar: {
    enabled: false,
  },

  build: {
    inlineStylesheets: 'always',
  },

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

    // This site is fully static (mode: "static"), so Astro emits no server
    // build and dist/server is empty. The default workerd prerenderer points
    // a preview server at that empty dir, so /__astro_prerender answers 200
    // with the string "[object Object]", which Astro writes as index.html.
    // Prerender in Node instead; nothing here needs the workers runtime.
    prerenderEnvironment: 'node',
  }),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['msw', 'msw/node', '@mswjs/interceptors'],
    },
  },
});
