export const TIME_E2E_IDS = [
  'time:day',
  'time:week',
  'time:month',
  'time:year',
] as const;

export type TimeE2eId = (typeof TIME_E2E_IDS)[number];
