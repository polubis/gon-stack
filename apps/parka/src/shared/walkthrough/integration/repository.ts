import type { WalkthroughOutcome } from '../domain/models';
import { toOutcome } from './mappers';

// Persistence boundary for this module: whether a given walkthrough
// (identified by `persistenceKey`) has already been completed or skipped by
// this browser. No backend endpoint exists for this yet, so `localStorage`
// stands in as "integration" — swap this file alone if that changes.

export const getOutcome = (
  persistenceKey: string,
): WalkthroughOutcome | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return toOutcome(window.localStorage.getItem(persistenceKey));
};

export const saveOutcome = (
  persistenceKey: string,
  outcome: WalkthroughOutcome,
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(persistenceKey, outcome);
};
