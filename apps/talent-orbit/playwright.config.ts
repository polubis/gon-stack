import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@repo/vibe-test';

const base = createPlaywrightConfig({ port: 4326 });

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    contextOptions: { reducedMotion: 'reduce' },
  },
});
