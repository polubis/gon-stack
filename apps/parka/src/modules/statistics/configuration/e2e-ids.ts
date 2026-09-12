export const STATISTICS_E2E_IDS = [
  'statistics:main',
  'statistics:total',
  'statistics:current',
  'statistics:changes',
] as const;

export type StatisticsE2eDynamicId = `statistics:range:${string | number}`;

export type StatisticsE2eId =
  (typeof STATISTICS_E2E_IDS)[number] | StatisticsE2eDynamicId;
