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
  'time:stats',
  'time:stats-skeleton',
  'time:stats-empty',
  'time:stats-completion',
  'time:stats-total',
  'time:stats-per-day',
  'time:stats-overdue',
  'time:stats-active',
  'time:stats-active-empty',
  'time:stats-backlog',
  'time:view-tabs',
  'time:open-only',
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
  'time:category-save',
  'time:category-delete',
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
  'time:task-details-key',
  'time:description-full',
  'time:attachments',
  'time:attachments-skeleton',
  'time:attachments-error',
  'time:attachment-add',
  'time:attachment-input',
  'time:attachment-viewer',
  'time:attachment-trim',
  'time:comments',
  'time:comments-skeleton',
  'time:comments-error',
  'time:comments-empty',
  'time:comment-add',
  'time:comment-form',
  'time:comment-input',
  'time:comment-save',
  'time:comment-cancel',
  'time:history',
  'time:history-toggle',
  'time:history-skeleton',
  'time:history-error',
  'time:history-empty',
  'time:statuses-dialog',
  'time:statuses-edit',
  'time:statuses-save',
  'time:status-add',
  'time:task-status',
  'time:add-trigger',
  'time:add-fab',
  'time:open-only-toggle',
  'time:empty-add',
  'time:task-name',
  'time:task-cancel',
  'time:recurring-toggle',
  'time:backlog-name',
  'time:description-input',
  'time:attachment-media',
  'time:trim-start',
  'time:trim-length',
  'time:trim-save',
] as const;

export type TimeDynamicE2eId =
  | `time:form-icon:${string}`
  | `time:form-color-option:${string}`
  | `time:add-day:${string}`
  | `time:task:${string | number}`
  | `time:task-key:${string | number}`
  | `time:task-done:${string | number}`
  | `time:task-progress-badge:${string | number}`
  | `time:task-info:${string | number}`
  | `time:task-edit:${string | number}`
  | `time:task-move:${string | number}`
  | `time:task-backlog:${string | number}`
  | `time:task-delete:${string | number}`
  | `time:task-more:${string | number}`
  | `time:task-date:${string | number}`
  | `time:attachment:${string}`
  | `time:attachment-thumb:${string}`
  | `time:attachment-delete:${string}`
  | `time:comment:${string}`
  | `time:comment-avatar:${string}`
  | `time:comment-author:${string}`
  | `time:comment-time:${string}`
  | `time:comment-edit:${string}`
  | `time:comment-delete:${string}`
  | `time:history-entry:${string}`
  | `time:status-name:${string}`
  | `time:status-delete:${string}`
  | `time:add-option:${string}`
  | `time:modal-close:${string}`
  | `time:category-option:${string}`
  | `time:priority-option:${string}`
  | `time:month-day:${string}`
  | `time:year-month:${number}`
  | `time:attachment-link:${string}`;

export type TimeE2eId = (typeof TIME_E2E_IDS)[number] | TimeDynamicE2eId;
