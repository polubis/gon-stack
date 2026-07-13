import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@repo/vibe-test';

export default defineConfig(createPlaywrightConfig({ port: 4324 }));
