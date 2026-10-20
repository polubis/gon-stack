export const PERIOD_CONTROL_E2E_IDS = [
  'period-control:prev',
  'period-control:next',
  'period-control:label',
  'period-control:jump',
  'period-control:value',
  'period-control:kind',
  'period-control:day',
  'period-control:today',
] as const;

export type PeriodControlDynamicE2eId =
  `period-control:preset:${string}` | `period-control:option:${string}`;

export type PeriodControlE2eId =
  (typeof PERIOD_CONTROL_E2E_IDS)[number] | PeriodControlDynamicE2eId;
