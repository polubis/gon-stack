import { defineConfig } from '@playwright/test';
import { ports } from '@repo/ecosystem-resources/ports';
import { createPlaywrightConfig } from '@repo/vibe-test';

export default defineConfig(
  createPlaywrightConfig({ port: ports.e2e['content-maker'] }),
);
