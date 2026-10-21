export const FORM_MEMORY_E2E_IDS = [
  'form-memory:manage-dialog',
  'form-memory:manage-list',
  'form-memory:manage-empty',
  'form-memory:manage-edit-input',
  'form-memory:manage-edit-save',
  'form-memory:manage-edit-error',
  'form-memory:delete-dialog',
  'form-memory:delete-confirm',
  'form-memory:toast',
] as const;

export type FormMemoryDynamicE2eId =
  | `form-memory:manage:${string}`
  | `form-memory:manage-row:${string}`
  | `form-memory:manage-edit:${string}`
  | `form-memory:manage-delete:${string}`;

export type FormMemoryE2eId =
  (typeof FORM_MEMORY_E2E_IDS)[number] | FormMemoryDynamicE2eId;
