/** `0` → `dziś`, `1` → `1 dzień temu`, `n` → `n dni temu`. */
export const ageLabel = (days: number): string =>
  days === 0 ? 'dziś' : days === 1 ? '1 dzień temu' : `${days} dni temu`;
