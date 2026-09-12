// Exact `data-e2e` ids this module renders. Kept as a `const` array (not
// just a union) so the list is enumerable at runtime too, not only checked
// at compile time. Root-combined in `src/__e2e__/selectors.d.ts` — this file
// never touches the DOM `data-e2e` type augmentation itself.
export const WALKTHROUGH_E2E_IDS = [
  'walkthrough:main',
  'walkthrough:primary',
  'walkthrough:skip',
] as const;

export type WalkthroughE2eId = (typeof WALKTHROUGH_E2E_IDS)[number];
