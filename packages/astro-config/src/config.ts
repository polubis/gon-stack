import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export type CreateAstroConfigOptions = {
  /** Canonical site URL used by sitemap and absolute URL generation. */
  site: string;
};

export const createAstroConfig = ({ site }: CreateAstroConfigOptions) =>
  defineConfig({
    site,

    output: 'server',

    devToolbar: {
      enabled: false,
    },

    build: {
      inlineStylesheets: 'always',
    },

    image: {
      service: {
        entrypoint: '@repo/astro-config/image-service',
      },
    },

    adapter: cloudflare({
      platformProxy: {
        enabled: true,
      },

      imageService: 'compile',

      // Disable the workerd dev-inspector during build. It binds a fixed port
      // (default 9229) via @cloudflare/vite-plugin; when Turbo builds multiple
      // Cloudflare apps in parallel they race on that port and one fails with
      // EADDRINUSE. The inspector is a debugging-only feature, unused in CI.
      inspectorPort: false,

      // The default "workerd" prerender environment spins up a second embedded
      // Workers runtime just to render `prerender: true` pages, both in `astro
      // dev` and at build time. That extra runtime is flaky on dev-server
      // restarts (Vite dependency re-optimization) and can serve a blank page
      // with a "server connection lost" console error. Render prerendered
      // pages in plain Node instead; none of them touch Cloudflare bindings.
      prerenderEnvironment: 'node',
    } as NonNullable<Parameters<typeof cloudflare>[0]>),

    integrations: [react(), sitemap()],

    vite: {
      plugins: [tailwindcss()],
      optimizeDeps: {
        exclude: ['msw', 'msw/node', '@mswjs/interceptors'],
      },
    },
  });
