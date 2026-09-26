import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@repo/vibe-test';

const base = createPlaywrightConfig({ port: 4325, host: 'localhost' });
const deviceUse = base.projects![0]!.use;

// backend.spec.ts and rest-endpoints.spec.ts drive the real Supabase backend
// through the single wrangler dev process; running them concurrently with the
// other 29 (mostly local-mode) specs starves their page loads and flakes.
// Isolating them into a project that runs after the fast batch removes the
// contention instead of loosening timeouts.
const REAL_BACKEND_SPECS = [
  '**/__e2e__/backend.spec.ts',
  '**/server/__e2e__/rest-endpoints.spec.ts',
];

export default defineConfig({
  ...base,
  use: {
    ...base.use,
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'chromium', use: deviceUse, testIgnore: REAL_BACKEND_SPECS },
    {
      name: 'chromium-real-backend',
      use: deviceUse,
      testMatch: REAL_BACKEND_SPECS,
      fullyParallel: false,
      dependencies: ['chromium'],
    },
  ],
});
