export const CATEGORIES_E2E_IDS = [
  'categories:main',
  'categories:list',
  'categories:add',
  'categories:form',
  'categories:form-name-error',
  'categories:form-icons',
  'categories:form-icon-search',
  'categories:form-icon-groups',
  'categories:not-found',
  'categories:form-name',
  'categories:form-color',
  'categories:form-save',
  'categories:form-delete',
  'categories:delete-dialog',
  'categories:delete-confirm',
  'categories:add-defaults',
  'categories:load-error',
  'categories:toast',
] as const;

export type CategoriesE2eDynamicId =
  | `categories:row:${string | number}`
  | `categories:add-default:${string | number}`
  | `categories:form-icon:${string}`
  | `categories:form-color-option:${string}`;

export type CategoriesE2eId =
  (typeof CATEGORIES_E2E_IDS)[number] | CategoriesE2eDynamicId;
