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
  'time:task-dialog',
  'time:task-save',
  'time:task-delete',
  'time:task-device',
  'time:task-row-device',
  'time:recurring-mark',
  'time:recurring-interval',
  'time:recurring-end',
  'time:recurring-stop',
  'time:delete-dialog',
  'time:delete-confirm',
  'time:category-dialog',
  'time:priority-dialog',
  'time:categories-dialog',
  'time:add-menu',
  'time:backlog-open',
  'time:backlog-dialog',
  'time:backlog-add',
  'time:backlog-empty',
  'time:backlog-skeleton',
  'time:backlog-form',
  'time:backlog-save',
  'time:form-icons',
  'time:form-icon-search',
  'time:form-icon-groups',
  'time:form-color',
  'time:description-field',
  'time:description-expand',
  'time:description-editor',
  'time:task-details',
  'time:task-details-edit',
  'time:description-clamp',
  'time:description-more',
  'time:description-full',
] as const;

export type TimeDynamicE2eId =
  | `time:form-icon:${string}`
  | `time:form-color-option:${string}`
  | `time:add-day:${string}`
  | `time:task:${string | number}`
  | `time:task-done:${string | number}`
  | `time:task-info:${string | number}`
  | `time:backlog-task:${string | number}`
  | `time:backlog-move:${string | number}`
  | `time:backlog-delete:${string | number}`
  | `time:backlog-edit:${string | number}`
  | `time:backlog-date:${string | number}`;

export type TimeE2eId = (typeof TIME_E2E_IDS)[number] | TimeDynamicE2eId;
