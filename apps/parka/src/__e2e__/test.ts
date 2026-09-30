import { createE2eTest, type E2eContext } from '@repo/vibe-test';
import type { E2eId } from './selectors';

export const test = createE2eTest<E2eId>();

/** Context handed to every interpreter command in Parka's e2e specs. */
export type Ctx = E2eContext<E2eId>;
