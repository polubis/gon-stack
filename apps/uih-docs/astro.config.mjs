// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const uihSrc = fileURLToPath(
  new URL('../../packages/uih/src', import.meta.url),
);

// Pure SSG. `@repo/uih` is aliased to its sources (not `dist`), so edits in
// the library hot-reload in `astro dev` without rebuilding the package.
export default defineConfig({
  site: 'http://localhost:4321',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: '@repo/uih/button',
          replacement: `${uihSrc}/button/button.tsx`,
        },
        { find: '@repo/uih/theme', replacement: `${uihSrc}/theme` },
      ],
    },
  },
});
