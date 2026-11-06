import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@repo/vibe-test';

const base = createPlaywrightConfig({
  port: 4327,
  // `--ignore-lock`: stay in foreground (Astro auto-backgrounds under agents).
  webServerCommand:
    'pnpm astro preview --host 127.0.0.1 --port 4327 --ignore-lock',
});

export default defineConfig({
  ...base,
  use: { ...base.use, contextOptions: { reducedMotion: 'reduce' } },
});
