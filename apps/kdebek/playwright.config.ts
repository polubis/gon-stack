import { defineConfig } from '@playwright/test';
import { ports } from '@repo/ecosystem-resources/ports';
import { createPlaywrightConfig } from '@repo/vibe-test';

const base = createPlaywrightConfig({ port: ports.e2e.kdebek });

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    contextOptions: { reducedMotion: 'reduce' },
  },
});
