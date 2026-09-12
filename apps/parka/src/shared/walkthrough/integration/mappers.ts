import type { WalkthroughOutcome } from '../domain/models';

export const toOutcome = (raw: string | null): WalkthroughOutcome | null =>
  raw === 'completed' || raw === 'skipped' ? raw : null;
