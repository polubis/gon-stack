export const PERIOD_CONTROL_E2E_IDS = [
  'period-control:prev',
  'period-control:next',
  'period-control:label',
  'period-control:jump',
  'period-control:value',
  'period-control:kind',
  'period-control:day',
  'period-control:today',
  'period-control:range-dialog',
  'period-control:range-close',
  'period-control:range-prev',
  'period-control:range-next',
  'period-control:range-month',
  'period-control:range-year',
  'period-control:range-year-prev',
  'period-control:range-year-next',
  'period-control:range-apply',
] as const;

export type PeriodControlDynamicE2eId =
  | `period-control:preset:${string}`
  | `period-control:option:${string}`
  | `period-control:range-day:${string}`
  | `period-control:range-month-option:${string}`;

export type PeriodControlE2eId =
  (typeof PERIOD_CONTROL_E2E_IDS)[number] | PeriodControlDynamicE2eId;
