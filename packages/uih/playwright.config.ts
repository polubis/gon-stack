import { defineConfig } from '@playwright/test';
import { ports } from '@repo/ecosystem-resources/ports';
import { createPlaywrightConfig } from '@repo/vibe-test';

const port = ports.e2e.uih;
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
