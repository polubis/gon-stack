import { createE2eTest } from '@repo/vibe-test';
import type { E2eId } from './selectors.js';

export const test = createE2eTest<E2eId>();
