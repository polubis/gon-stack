import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@repo/vibe-test';

const port = 4327;
const host = '127.0.0.1';
const base = createPlaywrightConfig({
  port,
  host,
  // The docs app is the real consumer of the library: build it, then serve the static output.
  webServerCommand: `pnpm --filter uih-docs build && pnpm --filter uih-docs exec astro preview --host ${host} --port ${port}`,
});

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    contextOptions: { reducedMotion: 'reduce' },
  },
});
