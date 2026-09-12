// Exact `data-e2e` ids this module renders. Root-combined in
// `src/__e2e__/selectors.d.ts`.
export const HOME_E2E_IDS = ['home:main'] as const;

export type HomeE2eId = (typeof HOME_E2E_IDS)[number];
