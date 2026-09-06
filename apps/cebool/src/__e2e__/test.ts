import type { Locator, Page } from '@playwright/test';
import { createE2eTest } from '@repo/vibe-test';
import type { E2eId } from './selectors';

export const test = createE2eTest<E2eId>();

export type Ctx = { page: Page; getByE2e: (id: E2eId) => Locator };
