export const TIME_E2E_IDS = [
  'time:day',
  'time:week',
  'time:month',
  'time:year',
  'time:main',
  'time:toast',
  'time:load-error',
  'time:empty',
  'time:skeleton',
  'time:prev',
  'time:next',
  'time:today',
  'time:task-dialog',
  'time:task-save',
  'time:task-delete',
  'time:delete-dialog',
  'time:delete-confirm',
  'time:category-dialog',
  'time:priority-dialog',
  'time:categories-dialog',
  'time:add-menu',
  'time:form-icons',
  'time:form-icon-search',
  'time:form-icon-groups',
  'time:form-color',
] as const;

export type TimeDynamicE2eId =
  | `time:form-icon:${string}`
  | `time:form-color-option:${string}`
  | `time:task:${string | number}`
  | `time:task-done:${string | number}`;

export type TimeE2eId = (typeof TIME_E2E_IDS)[number] | TimeDynamicE2eId;
